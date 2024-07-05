import React, { useState, FunctionComponent } from 'react';
import { Dropdown } from 'react-bootstrap';
import { DropdownMenuProps } from 'react-bootstrap/lib/DropdownMenu';
import { DropdownToggleProps } from 'react-bootstrap/lib/DropdownToggle';

interface SingleSelectionDropdownFilterProps {
    buttonText: string;
    items: string[];
    onFilterChange: (selectedItem: string | null) => void;
}

export const SingleSelectionDropdownFilter: FunctionComponent<SingleSelectionDropdownFilterProps> = ({
    buttonText,
    items,
    onFilterChange,
}) => {
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    const handleItemClick = (item: string) => {
        setSelectedItem(item);
        onFilterChange(item);
    };

    const handleClearSelection = (event: React.MouseEvent) => {
        event.stopPropagation();
        setSelectedItem(null);
        onFilterChange(null);
    };

    return (
        <div
            data-test="dropdown-single-selection-filter"
            style={{ paddingRight: 5 }}
        >
            <div className="input-group input-group-sm input-group-toggle">
                <Dropdown id="dropdown-single-selection-filter">
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
                        {selectedItem && (
                            <span
                                className="oncoprintDropdownCount"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginLeft: 5,
                                    marginRight: 5,
                                }}
                            >
                                {selectedItem}
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
                                    backgroundColor:
                                        item === selectedItem
                                            ? '#f1f1f1'
                                            : 'transparent',
                                }}
                            >
                                {item}
                            </div>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </div>
    );
};
