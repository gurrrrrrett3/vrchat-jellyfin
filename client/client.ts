// client/client.ts

import { Nested, SubFolder, SubItem } from "./types";

(async () => {

    class Ui {
        public static renderItems(views: SubFolder[]) {
            const container = document.getElementById("container")!;

            views.forEach(item => {
                const view = document.createElement("div");
                view.classList.add("folder");

                const titleContainer = document.createElement("div");
                titleContainer.classList.add("title-container");

                const title = document.createElement("h1");
                title.textContent = item.name;

                titleContainer.appendChild(title);
                view.appendChild(titleContainer);

                item.subItems.forEach(subItem => {
                    Ui.renderSubItem(subItem, view);
                });

                titleContainer.addEventListener("click", () => {
                    view.classList.toggle("open");
                    view.childNodes.forEach(node => {
                        if (node instanceof HTMLElement) {
                            if (node.classList.contains("subfolder") || node.classList.contains("subitem")) {
                                node.hidden = !view.classList.contains("open");
                            }
                        }
                    });
                });

                container.appendChild(view);
            });
        }

        public static renderSubItem(items: Nested, parent: HTMLElement) {
            if ("subItems" in items) {
                const container = document.createElement("div");
                container.classList.add("subfolder");
                container.hidden = true;

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
                    });
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

                titleContainer.addEventListener("click", async () => {
                    console.log("Title container clicked.");

                    if (title.hasAttribute("data-url")) {
                        console.log("Data URL already set. Exiting click handler.");
                        return;
                    }

                    try {
                        // Fetch available subtitle streams
                        console.log("Fetching subtitle streams...");
                        const subtitleStreams = await fetchSubtitleStreams(subItem.itemId);
                        console.log("Subtitle streams fetched:", subtitleStreams);

                        let selectedSubtitleIndex: number | null = null;

                        if (subtitleStreams && subtitleStreams.length > 0) {
                            // Present subtitle options to the user
                            console.log("Showing subtitle selection dialog...");
                            selectedSubtitleIndex = await showSubtitleSelectionDialog(subtitleStreams);
                            console.log("User selected subtitle index:", selectedSubtitleIndex);
                        } else {
                            console.log("No subtitles available or subtitleStreams is empty.");
                        }

                        // Request the proxy with subtitle options
                        console.log("Requesting proxy with subtitle options...");
                        const res = await fetch(`/i/${subItem.itemId}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                subtitleStreamIndex: selectedSubtitleIndex,
                            }),
                        });
                        if (!res.ok) {
                            throw new Error(`Failed to create proxy: ${res.status} ${res.statusText}`);
                        }
                        const data = await res.json();
                        const proxyId = data.id;

                        const path = `/v/${proxyId}`;
                        const fullUrl = `${window.location.origin}${path}`;

                        // Copy to clipboard or display link
                        if (navigator.clipboard) {
                            await navigator.clipboard.writeText(fullUrl);
                            console.log("Copied URL to clipboard:", fullUrl);

                            title.textContent = `${title.textContent} - Copied!`;
                            setTimeout(() => {
                                title.textContent = `${title.textContent!.replace(" - Copied!", "")}`;
                            }, 3000);
                        } else {
                            title.innerHTML = `${title.textContent} - <a href="${fullUrl}" target="_blank">Open</a>`;
                        }

                        title.setAttribute("data-url", fullUrl);
                        console.log("Proxy URL set and copied to clipboard:", fullUrl);
                    } catch (error) {
                        console.error("Error in click handler:", error);
                        alert('An error occurred while processing your request. Please try again.');
                    }
                });

                parent.appendChild(item);
            }
        }
    }

    // Function to fetch subtitle streams from the server
    async function fetchSubtitleStreams(itemId: string): Promise<any[]> {
        console.log(`Fetching subtitle streams for itemId: ${itemId}`);
        try {
            const res = await fetch(`/subtitles/${itemId}`);
            if (!res.ok) {
                throw new Error(`Failed to fetch subtitle streams: ${res.status} ${res.statusText}`);
            }
            const data = await res.json();
            console.log('Subtitle streams data:', data);
            return data.subtitleStreams;
        } catch (error) {
            console.error('Error fetching subtitle streams:', error);
            return [];
        }
    }

    // Function to show subtitle selection dialog
    async function showSubtitleSelectionDialog(subtitleStreams: any[]): Promise<number | null> {
        console.log('showSubtitleSelectionDialog called with:', subtitleStreams);
        return new Promise((resolve) => {
            // Create a modal dialog
            const modal = document.createElement('div');
            modal.classList.add('modal');

            const overlay = document.createElement('div');
            overlay.classList.add('overlay');

            const title = document.createElement('h3');
            title.textContent = 'Select Subtitle Track';

            const list = document.createElement('ul');

            subtitleStreams.forEach((stream) => {
                const listItem = document.createElement('li');
                const button = document.createElement('button');
                button.textContent = stream.Language || `Subtitle ${stream.Index}`;
                button.addEventListener('click', () => {
                    document.body.removeChild(overlay);
                    document.body.removeChild(modal);
                    resolve(stream.Index);
                });
                listItem.appendChild(button);
                list.appendChild(listItem);
            });

            const noSubtitlesButton = document.createElement('button');
            noSubtitlesButton.textContent = 'No Subtitles';
            noSubtitlesButton.addEventListener('click', () => {
                document.body.removeChild(overlay);
                document.body.removeChild(modal);
                resolve(null);
            });

            modal.appendChild(title);
            modal.appendChild(list);
            modal.appendChild(noSubtitlesButton);

            document.body.appendChild(overlay);
            document.body.appendChild(modal);

            console.log('Modal and overlay added to DOM');
        });
    }

    // Fetch initial items and render UI
    console.log("Fetching initial items...");
    try {
        const res = await fetch("/i");
        if (!res.ok) {
            throw new Error(`Failed to fetch initial items: ${res.status} ${res.statusText}`);
        }
        const items = await res.json();
        console.log("Initial items fetched:", items);
        Ui.renderItems(items);
    } catch (error) {
        console.error('Error fetching initial items:', error);
        alert('Failed to load media items. Please try again later.');
    }

})().catch(error => console.error('Error in client script:', error));
