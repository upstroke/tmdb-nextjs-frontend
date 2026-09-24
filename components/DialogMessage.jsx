export default function DialogMessage({ type = 'info', message, title }) {
  const iconMap = {
    info: 'info circle',
    warning: 'exclamation triangle',
    error: 'times circle',
    success: 'check circle',
  };
  const icon = iconMap[type] ?? iconMap.info;

  return (
    <div className={`ui message dialog-message dialog-message--${type}`}>
      <i className={`${icon} icon`} aria-hidden="true" />
      <div className="content">
        {title && <div className="header">{title}</div>}
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}
