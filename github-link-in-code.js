// ==UserScript==
// @name     Github link in code
// @version  0.1.0
// @grant    none
// @run-at      document-end
// @include     https://github.com/*
// @include     https://gist.github.com/*
// ==/UserScript==

const PATTERN_HTTP_URL =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
const PATTERN_NO_HTTP_URL =
  /^[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

const observer = new MutationObserver(() => {
  console.log("page changed!");
  replaceTextsToLinks();
});

observer.observe(document.body, {
  attributes: true,
  subtree: false,
  childList: false,
});

replaceTextsToLinks();

const styles = document.createElement("style");
styles.textContent = `
.custom-link{
  position: relative;
  display: inline-block;
}
.custom-link:hover .code-link-hover{
  display: block;
}
.code-link-hover{
  display: none;
  position: absolute;
  left: calc(100% + 2px);
  top: 0;
  padding: 4px 10px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  z-index: 100;
  color: #666;
}
`;

document.head.appendChild(styles);

function getFileType() {
  const filePathEl = document.querySelector("#blob-path .final-path");
  const filePath = filePathEl.textContent;
  // console.log('filePath: ', filePath);
  return filePath.slice(filePath.lastIndexOf(".") + 1);
}

function parseGithubUrl(urlStr) {
  const longPathMatch = urlStr.match(/^github\.com(\/.+){3}/);
  // console.log("longPathMatch: ", longPathMatch);
  if (!longPathMatch || !longPathMatch[1]) return {};

  const [urlHead, urlTail] = urlStr.split(longPathMatch[1]);
  // console.log("urlHead: ", urlHead);
  // console.log("urlTail: ", urlTail);
  const repoHomeUrl = urlHead;
  // console.log("repoHomeUrl: ", repoHomeUrl);
  const repoFileUrl = `${urlHead}/blob/master${longPathMatch[1]}${urlTail}`;
  return { repo: repoHomeUrl, file: repoFileUrl };
}

function createLink(pathStr) {
  const link = document.createElement("a");
  const httpUrl = /^https?:\/\//.test(pathStr) ? pathStr : `https://${pathStr}`;
  // console.log("httpUrl: ", httpUrl);
  link.href = httpUrl;
  link.textContent = pathStr;
  link.target = "_blank";
  link.rel = "nofollow";
  return link;
}

function replaceTextsToLinks() {
  const fileType = getFileType();
  const codeEls = Array.from(
    document.querySelectorAll(".js-blob-code-container table td>span")
  );
  // console.log("codeEl: ", codeEls.length);

  codeEls.forEach((el) => {
    // console.log(el.tagName, el.textContent);
    const content = el.textContent.trim().replace(/^(\'|\")|(\'|\")$/gm, "");
    if (
      content &&
      (PATTERN_HTTP_URL.test(content) || PATTERN_NO_HTTP_URL.test(content))
    ) {
      // console.log("content: ", content);
      // console
      const link = createLink(content);
      link.classList.add("custom-link");

      el.parentNode.appendChild(link);
      el.parentNode.insertBefore(link, el);
      el.remove();

      const { repo, file } = parseGithubUrl(content);

      if (fileType === "go" && repo) {
        // console.log("repoFileUrl: ", repoFileUrl);

        const div = document.createElement("div");
        div.classList.add("code-link-hover");

        const repoHomeLink = createLink(repo);
        const repoFileLink = createLink(file);

        link.href = repoHomeLink;
        div.innerHTML = `Repo File: ${repoFileLink.outerHTML}`;

        link.appendChild(div);
      }
    }
  });
}
