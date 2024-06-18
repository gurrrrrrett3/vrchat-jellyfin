export interface View {
    viewId: string;
    viewName: string;
    items: SubFolder[];
}

export type Nested = SubFolder | SubItem

export interface SubFolder {
    itemId: string;
    name: string;
    subItems: Nested[];
}

export interface SubItem {
    itemId: string;
    name: string;
    playable: boolean;
    episode?: number;
}

