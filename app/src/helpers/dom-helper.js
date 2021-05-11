export default class DOMHelper {
  static parseStringToDOM(string) {
    const parser = new DOMParser();
    return parser.parseFromString(string, "text/html");
  }

  static wrapTextNodes(dom) {
    const body = dom.body;
    let testNodes = [];

    function reqursy(element) {
      element.childNodes.forEach((node) => {
        if (
          node.nodeName === "#text" &&
          node.nodeValue.replace(/\s+/g, "").length > 0 // избавляемся от пустых узлов
        ) {
          testNodes.push(node);
        } else {
          reqursy(node);
        }
      });
    }

    reqursy(body);

    testNodes.forEach((node, ind) => {
      const wrapper = dom.createElement("text-editor");
      node.parentNode.replaceChild(wrapper, node);
      wrapper.appendChild(node);
      wrapper.setAttribute("nodeid", ind);
    });

    return dom;
  }

  static serializeDOMToString(dom) {
    const serializer = new XMLSerializer();
    return serializer.serializeToString(dom);
  }

  static unwrapTextNodes(dom) {
    dom.body.querySelectorAll("text-editor").forEach((element) => {
      element.parentNode.replaceChild(element.firstChild, element);
    });
  }

  static wrapImages(dom) {
    dom.body.querySelectorAll("img").forEach((image, index) => {
      image.setAttribute("editableimgid", index);
    });

    return dom;
  }

  static unwrapImages(dom) {
    dom.body.querySelectorAll("[editableimgid]").forEach((image) => {
      image.removeAttribute("editableimgid");
    });
  }
}
