import * as React from 'react'
import { StyledBox } from './components/design-system'

function Home() {
  return (
    <StyledBox>
      <h2>About me</h2>
      <p>
        I'm just a really passionate programmer that is currently delving on the
        misteries of the frontend side of web apps. It's a mess, but it is also
        so much fun!
      </p>
      <p>
        I'm from <b>Spain</b>, and currently living on <b>Madrid</b>, doing
        web-stuff and trying to learn new things every day. My career has gone
        from developing <b>.Net WebForms</b> to <b>.NET MVC</b> web sites and
        finally making my escape to the front lines.
      </p>
      <p>
        After some experiments with different frameworks, I found out that{' '}
        <b>React</b> is the one I enjoy the best to use whenever I need a web
        application. And yeah, I know it's not a framework, it's a library. And
        yeah, I'd say that's the very reason I love it.
      </p>
      <section>
        <p>
          If you want to know more about me, you may look at any of the next
          resources:
        </p>
        <ul>
          <li>
            <a href="https://www.linkedin.com/in/gonzalo-arrivi-duarte-19645724/">
              LinkedIn
            </a>
          </li>
          <li>
            <a href="https://codepen.io/Toujimon/">Codepen.io</a>
          </li>
          <li>
            <a href="https://github.com/Toujimon">GitHub</a>
          </li>
          <li>
            <a href="https://stackoverflow.com/users/859825/gonarrivi">
              StackOverflow
            </a>
          </li>
        </ul>
      </section>
      <h2>About this site</h2>
      <p>
        This site was created as my own sandbox to test different web related
        things creating little apps for my enjoyment. In this case using{' '}
        <b>React</b> as the main frontend library (because I just love making
        components) and the amazing
        <b>styled-components</b> library to provide the styling (no CSS files
        around here, folks!).
      </p>
    </StyledBox>
  )
}

export default Home
