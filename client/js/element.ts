"use strict"

type child = (HTMLElement | string)[]

/**
 * Creates a new element with given properties
 * @param {string} tag The element tagName
 * @param {string} className The element class parameter
 * @param {Object} attributes The element's attributes {key: value}
 * @param  {Element[]} children Child elements to append
 * @returns New element
 */
export function el(tag: string, className: string, attributes: {[key: string]: string}, ...children: child) {
    const element = document.createElement(tag);
    if (className !== "") {
        element.classList.add(...className.split(" "));
    }
    Object.keys(attributes).forEach(key => {
        element.setAttribute(key, attributes[key]);
    });
    children.forEach(child => {
        if (typeof child === 'string') {
            element.innerHTML += child
        } else {
            element.appendChild(child)
        }
    });
    return element;
}

/**
 * A convenient shorthand for createTextNode
 */
export const textNode = document.createTextNode.bind(document)
