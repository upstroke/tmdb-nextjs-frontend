export function MockLink({ children, href, ...props }) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}

export function MockImage({ src, alt, ...props }) {
  return <img src={src} alt={alt} {...props} />;
}
