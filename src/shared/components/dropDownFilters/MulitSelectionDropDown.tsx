import React, { useState, FunctionComponent } from 'react';
import { Dropdown } from 'react-bootstrap';
import { DropdownMenuProps } from 'react-bootstrap/lib/DropdownMenu';
import { DropdownToggleProps } from 'react-bootstrap/lib/DropdownToggle';

interface MultiSelectionDropdownFilterProps {
    buttonText: string;
    items: string[];
    onFilterChange: (selectedItems: string[]) => void;
    onReset: () => void;
}

export const MultiSelectionDropdownFilter: FunctionComponent<MultiSelectionDropdownFilterProps> = ({
    buttonText,
    items,
    onFilterChange,
    onReset,
}) => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const handleItemClick = (item: string) => {
        setSelectedItems(prevItems => {
            const newItems = prevItems.includes(item)
                ? prevItems.filter(i => i !== item)
                : [...prevItems, item];
            onFilterChange(newItems);
            return newItems;
        });
    };

    const handleClearSelection = (event: React.MouseEvent) => {
        event.stopPropagation();
        setSelectedItems([]);
        onFilterChange([]);
        onReset();
    };

    return (
        <div
            data-test="dropdown-multi-selection-filter"
            style={{ paddingRight: 5 }}
        >
            <div className="input-group input-group-sm input-group-toggle">
                <Dropdown id="dropdown-multi-selection-filter">
                    <Dropdown.Toggle
                        {...({
                            rootCloseEvent: 'click',
                        } as DropdownToggleProps)}
                        className="btn-sm"
                        style={{
                            minWidth: 118,
                            maxWidth: 250,
                            textAlign: 'right',
                            float: 'right',
                            paddingRight: 5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <span
                            style={{
                                float: 'left',
                                paddingLeft: 0,
                                marginLeft: 0,
                            }}
                        >
                            {buttonText}
                        </span>
                        {selectedItems.length > 0 && (
                            <span
                                className="oncoprintDropdownCount"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginLeft: 5,
                                    marginRight: 5,
                                }}
                            >
                                {selectedItems.length} selected
                                <button
                                    onClick={handleClearSelection}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        padding: 0,
                                        marginLeft: 5,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <span
                                        style={{
                                            display: 'inline-block',
                                            width: '10px',
                                            height: '10px',
                                            position: 'relative',
                                        }}
                                    >
                                        <span
                                            style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                width: '10px',
                                                height: '2px',
                                                backgroundColor: '#000',
                                                transform:
                                                    'translate(-50%, -50%) rotate(45deg)',
                                            }}
                                        />
                                        <span
                                            style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                width: '10px',
                                                height: '2px',
                                                backgroundColor: '#000',
                                                transform:
                                                    'translate(-50%, -50%) rotate(-45deg)',
                                            }}
                                        />
                                    </span>
                                </button>
                            </span>
                        )}
                    </Dropdown.Toggle>
                    <Dropdown.Menu
                        {...({ bsRole: 'menu' } as DropdownMenuProps)}
                        style={{
                            paddingLeft: 10,
                            overflow: 'auto',
                            maxHeight: 300,
                            whiteSpace: 'nowrap',
                            paddingRight: 1,
                            width: 350,
                        }}
                    >
                        {items.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => handleItemClick(item)}
                                style={{
                                    padding: '10px 20px',
                                    cursor: 'pointer',
                                    backgroundColor: selectedItems.includes(
                                        item
                                    )
                                        ? '#f1f1f1'
                                        : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedItems.includes(item)}
                                    readOnly
                                    style={{ marginRight: 8 }}
                                />
                                {item}
                            </div>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </div>
    );
};
