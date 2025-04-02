/* eslint-disable @typescript-eslint/no-explicit-any */
import { CdkDrag, CdkDragDrop, CdkDragMove, CdkDragPlaceholder, CdkDropList } from '@angular/cdk/drag-drop';
import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ValueGetter } from '@codinus/types';
import { CodinusTreeModule, CSTreeFeatures } from '@ngx-codinus/material/tree';

interface FoodNode {
    name: string;
    children?: FoodNode[];
}

const TREE_DATA: FoodNode[] = [
    {
        name: 'Fruit',
        children: [{ name: 'Apple' }, { name: 'Banana' }, { name: 'Fruit loops' }],
    },
    {
        name: 'Vegetables',
        children: [
            {
                name: 'Green',
                children: [{ name: 'Broccoli' }, { name: 'Brussels sprouts' }],
            },
            {
                name: 'Orange',
                children: [{ name: 'Pumpkins' }, { name: 'Carrots' }],
            },
        ],
    },
];

@Component({
    selector: 'cs-tree-example',
    templateUrl: './cs-tree-example.html',
    imports: [CodinusTreeModule, JsonPipe, ReactiveFormsModule, CdkDropList, CdkDrag, CdkDragPlaceholder]
})

export class CSTreeExample {

    handleDrag(args: CdkDragDrop<any, any, any>) {
        const dropItem = args.container.getSortedItems().find(e => getElementsUnderPoint(e.element.nativeElement, args.dropPoint.x, args.dropPoint.y));
        // if (dropItem?.element.nativeElement.matches(".cs-tree-node::before")) {
        //     console.log("Hovering on ::before");
        // }
        console.log(dropItem?.data, args.item.data);
    }


    addNewChild(csTree: CSTreeFeatures<{ iKey: number; name: string; pIkey?: number; }>) {
        csTree.add({ iKey: 20, name: 'New Child', pIkey: 7 })
    }

    addNewRoot(csTree: CSTreeFeatures<{ iKey: number; name: string; pIkey?: number; }>) {
        csTree.add({ iKey: 20, name: 'New Root' })
    }

    setCurrent(features: CSTreeFeatures<{ iKey: number; name: string; pIkey?: number; }>) {
        //features.add({ iKey: 20, name: 'ahmed' });
        features.setCurrentItem(this.testDataSource[10]);
    }

    setCurrent2(features: CSTreeFeatures<FoodNode>) {
        features.setCurrentItem(TREE_DATA[1].children?.at(1)?.children?.at(1));
    }

    addNewRoot2(features: CSTreeFeatures<FoodNode>) {
        features.add({ name: 'xxx' })
        //features.setCurrentItem(TREE_DATA[1].children?.at(1)?.children?.at(1));
    }

    addNewChild2(features: CSTreeFeatures<FoodNode>) {
        features.add({ name: 'xxx' }, TREE_DATA[1])
        //features.setCurrentItem(TREE_DATA[1].children?.at(1)?.children?.at(1));
    }

    remove(tree: CSTreeFeatures<FoodNode> | CSTreeFeatures<{ iKey: number; name: string; pIkey?: number; }>) {
        tree.remove();
    }

    testDataSource = [
        { iKey: 1, name: 'Fruit' },
        { iKey: 2, name: 'Apple', pIkey: 1 },
        { iKey: 3, name: 'Banana', pIkey: 1 },
        { iKey: 4, name: 'Fruit loops', pIkey: 1 },
        { iKey: 5, name: 'Vegetables' },
        { iKey: 6, name: 'Green', pIkey: 5 },
        { iKey: 7, name: 'Orange', pIkey: 5 },
        { iKey: 8, name: 'Broccoli', pIkey: 6 },
        { iKey: 9, name: 'Brussels sprouts', pIkey: 6 },
        { iKey: 10, name: 'Pumpkins', pIkey: 7 },
        { iKey: 11, name: 'Carrots', pIkey: 7 }
    ];

    treeFormControl = new FormControl([...TREE_DATA]);

    dataSourceWithChildren = TREE_DATA;

    childrenAccessor = (node: FoodNode) => {
        if (node.name === 'Banana')
            return null;
        return node.children ?? (node.children = []);
    }

    hasChild = (_: number, node: FoodNode) => {
        return !!node.children && node.children.length > 0;

    }
    iconGetter: ValueGetter<unknown> = () => 'home';

    logHandler(handler: unknown) {
        console.log(handler);
    }

    log(handler: any, nodeData: any) {
        console.log(handler);
        console.log(nodeData);
    }
}

function getElementsUnderPoint(element: HTMLElement, x: number, y: number) {
    const rect = element.getBoundingClientRect();
    return (
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
    );
}
