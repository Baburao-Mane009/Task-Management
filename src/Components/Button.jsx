function Button({ children, type = "button", variant, onClick }) {
  return (
    <button
      className={variant}
      type={type}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;