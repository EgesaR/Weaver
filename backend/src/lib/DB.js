import fs from "fs";
import path from "path";

// ------------------ QUERY MATCHING ------------------
function matchDocument(doc, query) {
  for (const key in query) {
    if (key.startsWith("$")) {
      switch (key) {
        case "$and":
          if (!query[key].every((subQuery) => matchDocument(doc, subQuery)))
            return false;
          break;
        case "$or":
          if (!query[key].some((subQuery) => matchDocument(doc, subQuery)))
            return false;
          break;
        case "$nor":
          if (query[key].some((subQuery) => matchDocument(doc, subQuery)))
            return false;
          break;
        case "$not":
          if (matchDocument(doc, query[key])) return false;
          break;
        default:
          return false;
        }
      } else {
        const docValue = doc[key];
        const queryValue = query[key];

        if (typeof queryValue === "object" && queryValue !== null) {
          for (const op in queryValue) {
            const opValue = queryValue[op];
            switch (op) {
            case "$eq":
              if (docValue !== opValue) return false;
              break;
            case "$ne":
              if (docValue === opValue) return false;
              break;
            case "$gt":
              if (!(docValue > opValue)) return false;
              break;
            case "$gte":
              if (!(docValue >= opValue)) return false;
              break;
            case "$lt":
              if (!(docValue < opValue)) return false;
              break;
            case "$lte":
              if (!(docValue <= opValue)) return false;
              break;
            case "$in":
              if (!Array.isArray(opValue) || !opValue.includes(docValue))
                return false;
              break;
            case "$nin":
              if (Array.isArray(opValue) && opValue.includes(docValue))
                return false;
              break;
            case "$regex":
              if (!(opValue instanceof RegExp))
                throw new Error(`$regex for ${key} must be RegExp`);
              if (typeof docValue !== "string" || !opValue.test(docValue))
                return false;
              break;
            default:
              return false;
            }
          }
        } else {
          if (docValue !== queryValue) return false;
        }
      }
    }
    return true;
  }

  // ------------------ UPDATES ------------------
  function applyUpdate(doc, update) {
    for (const key in update) {
      if (key.startsWith("$")) {
        switch (key) {
        case "$set":
          Object.assign(doc, update[key]);
          break;
        case "$inc":
          for (const field in update[key]) {
            doc[field] = (doc[field] || 0) + update[key][field];
          }
          break;
        case "$addToSet":
          for (const field in update[key]) {
            if (!Array.isArray(doc[field])) doc[field] = [];
            if (!doc[field].includes(update[key][field])) {
              doc[field].push(update[key][field]);
            }
          }
          break;
        case "$push":
          for (const field in update[key]) {
            if (!Array.isArray(doc[field])) doc[field] = [];
            doc[field].push(update[key][field]);
          }
          break;
        }
      } else {
        doc[key] = update[key];
      }
    }
  }

  // ------------------ QUERY CLASS ------------------
  class Query {
  constructor(db, query = {}) {
    this.db = db;
    this.query = query;
    this._sort = null;
    this._select = null;
    this._skip = 0;
    this._limit = null;
  }

  // Add chained filters
  where(filter) {
    this.query = { $and: [this.query, filter] };
    return this;
  }

  sort(sortObj) {
    this._sort = sortObj;
    return this;
  }

  select(fields) {
    if (typeof fields === 'string') {
      this._select = fields.split(/\s+/).filter(f => f.length > 0);
    } else if (Array.isArray(fields)) {
      this._select = fields;
    }

    // Validate: cannot mix inclusion + exclusion
    if (this._select) {
      const hasExclusion = this._select.some(f => f.startsWith('-'));
      const hasInclusion = this._select.some(f => !f.startsWith('-'));
      if (hasExclusion && hasInclusion) {
        throw new Error('Cannot mix inclusion and exclusion fields in select()');
      }
    }

    return this;
  }

  skip(n) {
    this._skip = n;
    return this;
  }

  limit(n) {
    this._limit = n;
    return this;
  }

  exec() {
    let results = this.db.data.filter(doc => matchDocument(doc, this.query));

    // Sorting
    if (this._sort) {
      results = results.sort((a, b) => {
        for (const field in this._sort) {
          const dir = this._sort[field];
          if (a[field] > b[field]) return dir === 1 ? 1 : -1;
          if (a[field] < b[field]) return dir === 1 ? -1 : 1;
        }
        return 0;
      });
    }

    // Skip & Limit
    if (this._skip) results = results.slice(this._skip);
    if (this._limit !== null) results = results.slice(0, this._limit);

    // Projection (select)
    if (this._select) {
      const isExclusion = this._select.some(f => f.startsWith('-'));

      results = results.map(doc => {
        if (isExclusion) {
          const projected = { ...doc };
          this._select.forEach(f => {
            if (f.startsWith('-')) {
              const field = f.slice(1);
              delete projected[field];
            }
          });
          return projected;
        } else {
          const projected = {};
          this._select.forEach(f => {
            if (f in doc) projected[f] = doc[f];
          });
          return projected;
        }
      });
    }

    return results;
  }

  findOneExec() {
    return this.db.data.find(doc => matchDocument(doc, this.query)) || null;
  }
}


  // ------------------ DB CLASS ------------------
  class DB {
    static #instances = new Map();

    static getInstance(collectionName) {
      collectionName = collectionName.toLowerCase();
      if (!DB.#instances.has(collectionName)) {
        DB.#instances.set(collectionName, new DB(collectionName));
      }
      return DB.#instances.get(collectionName);
    }

    constructor(collectionName) {
      this.collectionName = collectionName.toLowerCase();
      this.filePath = path.join(process.cwd(), "data", `${this.collectionName}.json`);
      console.log(this.filePath)
      this.data = [];
      this.nextId = 1;

      const dataDir = path.join(process.cwd(), "data");
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

      if (fs.existsSync(this.filePath)) {
        this.data = JSON.parse(fs.readFileSync(this.filePath, "utf8"));
        this.nextId =
        this.data.reduce((max, d) => Math.max(max, d._id || 0), 0) + 1;
      } else {
        this.save();
      }
    }

    save() {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
    }

    find(query = {}) {
      return new Query(this, query);
    }
    findOne(query = {}) {
      return new Query(this, query).findOneExec();
    }
    findOneBy(field, value) {
      return this.findOne({
        [field]: value
      });
    }

    insertOne(doc) {
      if (typeof doc !== "object" || doc === null)
        throw new Error("Document must be object");
      doc = {
        _id: this.nextId++,
        ...doc
      }
      this.data.push(doc);
      this.save();
      return doc;
    }
    insertMany(docs) {
      if (!Array.isArray(docs)) throw new Error("Documents must be array");
      const inserted = [];
      docs.forEach((d) => {
        if (typeof d !== "object" || d === null) return;
        d._id = this.nextId++;
        this.data.push(d);
        inserted.push(d);
      });
      if (inserted.length) this.save();
      return inserted;
    }

    updateOne(filter, update) {
      const doc = this.find(filter).findOneExec();
      if (doc) {
        applyUpdate(doc, update);
        this.save();
        return {
          matchedCount: 1,
          modifiedCount: 1
        };
      }
      return {
        matchedCount: 0,
        modifiedCount: 0
      };
    }

    updateMany(filter, update) {
      const docs = this.find(filter).exec();
      let modified = 0;
      docs.forEach((d) => {
        applyUpdate(d, update);
        modified++;
      });
      if (modified) this.save();
      return {
        matchedCount: docs.length,
        modifiedCount: modified
      };
    }

    deleteOne(filter) {
      const idx = this.data.findIndex((doc) => matchDocument(doc, filter));
      if (idx !== -1) {
        const deleted = this.data.splice(idx, 1)[0];
        this.save();
        return {
          deletedCount: 1,
          deletedDoc: deleted
        };
      }
      return {
        deletedCount: 0
      };
    }

    deleteMany(filter) {
      const toDelete = this.find(filter).exec();
      if (!toDelete.length) return {
        deletedCount: 0
      };
      this.data = this.data.filter((d) => !matchDocument(d, filter));
      this.save();
      return {
        deletedCount: toDelete.length
      };
    }

    countDocuments(filter = {}) {
      return this.find(filter).exec().length;
    }
  }

  // ------------------ MODEL CLASS ------------------
  class Model {
    constructor(collectionName, schema = {}) {
      this.db = DB.getInstance(collectionName);
      this.schema = schema;

      // auto add timestamps if not defined
      if (!this.schema.createdAt) {
        this.schema.createdAt = {
          type: "string",
        default: () => new Date().toISOString(),
        };
      }
      if (!this.schema.updatedAt) {
        this.schema.updatedAt = {
          type: "string",
        default: () => new Date().toISOString(),
        };
      }
    }

    validateDocument(doc, isNew = true) {
      for (const field in this.schema) {
        const {
          type,
          required,
          validate,
        default: def,
          unique
        } = this.schema[field];
        let value = doc[field];

        if (value === undefined && def) {
          value = doc[field] = typeof def === "function" ? def(): def;
        }

        if (required && (value === undefined || value === null)) {
          throw new Error(`${field} is required`);
        }

        if (value !== undefined && value !== null) {
          if (type === "string" && typeof value !== "string")
            throw new Error(`${field} must be string`);
          if (type === "number" && typeof value !== "number")
            throw new Error(`${field} must be number`);
          if (type === "boolean" && typeof value !== "boolean")
            throw new Error(`${field} must be boolean`);
          if (type === "array" && !Array.isArray(value))
            throw new Error(`${field} must be array`);
          if (validate) validate(value, field);

          // enforce uniqueness
          if (unique && isNew) {
            const exists = this.findOne({
              [field]: value
            });
            if (exists) throw new Error(`${field} must be unique`);
          }
        }
      }
    }

    create(doc) {
      doc.createdAt = new Date().toISOString();
      doc.updatedAt = new Date().toISOString();
      this.validateDocument(doc, true);
      return this.db.insertOne(doc);
    }

    createMany(docs) {
      docs.forEach((d) => {
        d.createdAt = new Date().toISOString();
        d.updatedAt = new Date().toISOString();
        this.validateDocument(d, true);
      });
      return this.db.insertMany(docs);
    }

    find(q = {}) {
      return this.db.find(q);
    }
    findOne(q = {}) {
      return this.db.findOne(q);
    }
    findOneBy(f, v) {
      return this.db.findOneBy(f, v);
    }

    updateOne(f, u) {
      if (!u.$set) u.$set = {};
      u.$set.updatedAt = new Date().toISOString();
      if (u.$set) this.validateDocument({
        ...u.$set
      }, false);
      return this.db.updateOne(f, u);
    }

    updateMany(f, u) {
      if (!u.$set) u.$set = {};
      u.$set.updatedAt = new Date().toISOString();
      if (u.$set) this.validateDocument({
        ...u.$set
      }, false);
      return this.db.updateMany(f, u);
    }

    deleteOne(f) {
      return this.db.deleteOne(f);
    }
    deleteMany(f) {
      return this.db.deleteMany(f);
    }

    countDocuments(f = {}) {
      return this.db.countDocuments(f);
    }
  }

  export {
    Model
  };