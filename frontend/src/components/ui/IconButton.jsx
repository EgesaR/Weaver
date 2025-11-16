const IconButton = ({ icon, onClick, className, ariaLabel }) => {
  return (
    <button
      type="button"
      class={`inline-flex items-center justify-center  text-fg-brand bg-neutral-primary border border-brand hover:bg-brand hover:text-white focus:ring-4 focus:ring-brand-subtle rounded-base w-8 h-8 focus:outline-none ${
        className ? className : ""
      }`}
      onClick={onClick}
    >
      {icon}
      <span class="sr-only">{ariaLabel ? ariaLabel : "Icon"}</span>
    </button>
  );
};

export default IconButton;
