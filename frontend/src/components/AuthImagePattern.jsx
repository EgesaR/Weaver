const AuthImagePattern = ({
  title, subtitle
}) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-white/40 p-12 pt-12 h-full">
      <div className="max-w-md h-full text-center flex flex-col justify-center mt-8">
        <div className="grid grid-cols-3 gap-3 mb-8 h-[68%] ">
          {[...Array(9)].map((_, i)=> (
            <div key={i} className={`aspect rounded-2xl bg-orange-500/80  ${ i % 2 === 0 ? "animate-pulse": ""}`} />
          ))}
        </div>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-base/60">
          {subtitle}
        </p>
      </div>
    </div>
  )
}

export default AuthImagePattern