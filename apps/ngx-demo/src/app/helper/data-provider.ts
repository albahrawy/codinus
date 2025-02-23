export interface PeriodicElement {
    name_en: string;
    name_ar: string;
    position: number;
    weight: number;
    symbol: string;
    nested: {
        weightx: number, symbolx: string,
        nested2: {
            weightx2: number, symbolx2: string,

        }
    },
    icon: string;
    avatar: string;
}

const BaseData = {
    name_en: ['Hydrogen', 'Helium', 'Lithium', 'Beryllium', 'Boron', 'Carbon', 'Nitrogen', 'Oxygen', 'Fluorine', 'Neon'],
    name_ar: ['هيدروجين', 'هيليوم', 'ليثيوم', 'بريليوم', 'بورون', 'كربون', 'نيتروجين', 'أكسجين', 'فلورين', 'نيون'],
    weight: 1.001,
    symbol: ['H', 'H', 'L', 'B', 'B', 'C', 'N', 'O', 'F', 'N']
}

export function createSampleData(count: number): PeriodicElement[] {
    const data = Array.from(Array(count + 1 - 1), (_, index) => {
        const position = index + 1;
        const newIndex = index % 10;
        return {
            name_en: BaseData.name_en[newIndex], name_ar: BaseData.name_ar[newIndex],
            position, symbol: BaseData.symbol[newIndex], weight: BaseData.weight * position,
            nested: {
                weightx: BaseData.weight * position + 6, symbolx: BaseData.symbol[newIndex],
                nested2: {
                    weightx2: BaseData.weight * position + 7, symbolx2: BaseData.symbol[newIndex]
                }
            },
            date: new Date(2023, index, newIndex),
            icon: 'home',
            avatar: (index + 1) % 5
                ? 'https://angular.io/generated/images/bios/devversion.jpg'
                : 'https://angular.io/generated/images/bios/jelbourn.jpg',
        };
    });
    return data;
}
