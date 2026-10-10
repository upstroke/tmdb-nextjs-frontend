export function MockLink({ children, href, ...props }) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}

export function MockImage({ src, alt, ...props }) {
  // Test double for next/image: a plain <img> is intended here.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} {...props} />;
}
