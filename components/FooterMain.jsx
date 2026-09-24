export default function FooterMain() {
  return (
    <div className="main-footer">
      <footer className="ui bottom fixed inverted menu">
        <nav className="ui inverted segment">
          <ul className="ui inverted secondary text menu">
            <li><span className="item">Conditions of Use</span></li>
            <li><span className="item">Privacy Policy</span></li>
            <li><a className="item" href="https://www.imdb.com/" rel="noopener noreferrer" target="_blank">Content: © by IMDb.com, Inc.</a></li>
            <li>
              <a className="item" href="https://www.justwatch.com/" rel="noopener noreferrer" target="_blank">Streaming-Provider</a>
              <span className="justwatch">© by JustWatch</span>
            </li>
          </ul>
        </nav>
      </footer>
    </div>
  );
}
