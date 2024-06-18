import { View, SubFolder, Nested, SubItem } from "./types";

export class Ui {
    public static renderItems(views: View[]) {

        const container = document.getElementById("container")!;

        views.forEach(item => {

            const view = document.createElement("div");
            view.classList.add("folder");

            const titleContainer = document.createElement("div");
            titleContainer.classList.add("title-container");

            const title = document.createElement("h1");
            title.textContent = item.viewName;

            titleContainer.appendChild(title);
            view.appendChild(titleContainer);

            item.items.forEach(subItem => {
                Ui.renderSubItem(subItem, view);
            });

            titleContainer.addEventListener("click", () => {
                view.classList.toggle("open");
                view.childNodes.forEach(node => {
                    if (node instanceof HTMLElement) {
                        if (node.classList.contains("subfolder")) {
                            node.hidden = !view.classList.contains("open");
                        }
                    }
                })
            })

            container.appendChild(view);


        });

    }

    public static renderSubItem(items: Nested, parent: HTMLElement) {


        if ("subItems" in items) {
            const container = document.createElement("div");
            container.classList.add("subfolder");
            container.hidden = true;

            container.setAttribute("data-item-id", items.itemId);
            container.setAttribute("data-item-name", items.name);

            const titleContainer = document.createElement("div");
            titleContainer.classList.add("title-container");

            const title = document.createElement("h2");
            title.textContent = items.name;

            titleContainer.appendChild(title);
            container.appendChild(titleContainer);

            titleContainer.addEventListener("click", () => {
                container.classList.toggle("open");
                container.childNodes.forEach(node => {
                    if (node instanceof HTMLElement) {
                        if (node.classList.contains("subfolder") || node.classList.contains("subitem")) {
                            node.hidden = !container.classList.contains("open");
                        }
                    }
                })
            });

            items.subItems.forEach(subItem => {
                this.renderSubItem(subItem, container);
            });

            parent.appendChild(container);
        } else {
            const subItem = items as SubItem;
            const item = document.createElement("div");
            item.classList.add("subitem");
            item.hidden = true;

            const titleContainer = document.createElement("div");
            titleContainer.classList.add("title-container");

            const title = document.createElement("h2");
            title.textContent = `${subItem.episode ? `Episode ${subItem.episode}: ` : ""} ${subItem.name}`;

            titleContainer.appendChild(title);
            item.appendChild(titleContainer);

            item.setAttribute("data-item-id", subItem.itemId);
            item.setAttribute("data-item-name", subItem.name);

            titleContainer.addEventListener("click", async () => {

                if (title.hasAttribute("data-url")) {
                    const url = title.getAttribute("data-url");

                    return
                }

                const res = await fetch(`/i/${subItem.itemId}`);
                const data = await res.json();
                const proxyId = data.id;

                const path = `/v/${proxyId}`;
                const fullUrl = `${window.location.origin}${path}`;

                // copy 
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(fullUrl);

                    title.textContent = `${title.textContent} - Copied!`;
                    setTimeout(() => {
                        title.textContent = `${title.textContent!.replace(" - Copied!", "")}`;
                    }, 3000);
                } else {
                    title.innerHTML = `${title.textContent} - <a href="${fullUrl}" target="_blank">Open</a>`;
                }

                title.setAttribute("data-url", fullUrl);

            })

            parent.appendChild(item);
        }
    }


}

fetch("/i").then(res => res.json()).then(Ui.renderItems.bind(Ui));

