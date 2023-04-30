function insertScriptBeforeNodeOrInHeaders<
  Nd extends HTMLElement,
  El extends HTMLElement
>(node: Nd, script: El) {
  if (node.parentNode != null) {
    node.parentNode.insertBefore(script, node);
  } else {
    const head = document.getElementsByTagName("head")[0];
    head.appendChild(script);
  }
}

export function insertScript(path: string): Promise<"loaded" | "present"> {
  return new Promise((resolve, reject) => {
    const moduleScript = document.createElement("script");
    moduleScript.setAttribute("async", "");
    moduleScript.setAttribute("type", "text/javascript");
    moduleScript.addEventListener("load", () => {
      resolve("loaded");
    });
    moduleScript.addEventListener("error", (err) => {
      reject(err);
    });
    moduleScript.src = path;

    const scripts = document.getElementsByTagName("script");

    let node: HTMLScriptElement | undefined;

    for (let i = 0; i < scripts.length; ) {
      if (scripts[i].src.endsWith(path)) {
        node = scripts[i];
        break;
      } else {
        i += 1;
      }
    }

    if (node != null) {
      resolve("present");
    } else {
      insertScriptBeforeNodeOrInHeaders(scripts[0], moduleScript);
    }
  });
}
