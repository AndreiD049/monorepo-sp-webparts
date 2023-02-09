import { Editor } from '@tiptap/react';
import styles from './MentionList.module.scss';
import * as React from 'react';
import { ISiteUserInfo } from 'sp-preset';
import { Persona, PersonaSize } from 'office-ui-fabric-react';

export interface IMentionListProps {
    items: ISiteUserInfo[];
    command: (item: unknown) => void;
    editor: Editor;
}

export default React.forwardRef((props: IMentionListProps, ref) => {
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    const selectItem = (index: number): void => {
        const item = props.items[index];

        if (item) {
            props.command({ id: item });
        }
    };

    const upHandler = (): void => {
        setSelectedIndex(
            (selectedIndex + props.items.length - 1) % props.items.length
        );
    };

    const downHandler = (): void => {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = (): void => {
        selectItem(selectedIndex);
    };

    React.useEffect(() => setSelectedIndex(0), [props.items]);

    React.useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === 'ArrowUp') {
                upHandler();
                return true;
            }

            if (event.key === 'ArrowDown') {
                downHandler();
                return true;
            }

            if (event.key === 'Enter') {
                enterHandler();
                return true;
            }

            return false;
        },
    }));

    return (
        <div className={styles.container}>
            {props.items.length ? (
                props.items.map((item, index) => (
                    <button
                        className={`${styles.item} ${
                            index === selectedIndex ?  styles.isSelected : ''
                        }`}
                        key={index + item.Title}
                        onClick={() => selectItem(index)}
                    >
                        <Persona 
                            text={item.Title}
                            size={PersonaSize.size24}
                            imageUrl={`/_layouts/15/userphoto.aspx?AccountName=${item.Email}&Size=M`}
                        />
                    </button>
                ))
            ) : (
                <div className="item">No result</div>
            )}
        </div>
    );
});
