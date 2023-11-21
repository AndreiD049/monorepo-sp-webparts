import { Icon } from '@microsoft/sp-component-base/node_modules/@fluentui/react';
import * as React from 'react';
import { Link } from 'react-router-dom';
import styles from './NavigationBar.module.scss';

type LinkProps = {
    name: string;
    to: string;
    icon?: string;
};

export interface INavigationBarProps {
    links: LinkProps[];
    farLinks?: LinkProps[];
}

export const NavigationBar: React.FC<INavigationBarProps> = (props) => {
    return (
        <div className={`${styles.container} ${styles.layout}`}>
            <img
                src={require('../../assets/uservoice_60.png')}
                height="60"
                alt="Logo"
                style={{ marginRight: '.5em' }}
            />
            <div
                style={{
                    display: 'flex',
                    flexFlow: 'row nowrap',
                    justifyContent: 'space-between',
                    width: '100%',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexFlow: 'row nowrap',
                        gap: '1em',
                    }}
                >
                    {props.links.map((link) => (
                        <div
                            style={{
                                display: 'flex',
                                flexFlow: 'row nowrap',
                                alignItems: 'center',
                                color: 'white',
                                borderBottom: '2px solid white',
                                cursor: 'pointer',
                            }}
                            key={link.to}
                        >
                            <Link
                                to={link.to}
                                style={{
                                    color: 'inherit',
                                    textDecoration: 'none',
                                }}
                            >
                                {link.icon && (
                                    <Icon
                                        iconName={link.icon}
                                        style={{ marginRight: '4px' }}
                                    />
                                )}
                                {link.name}
                            </Link>
                        </div>
                    ))}
                </div>
                <div
                    style={{
                        marginRight: '1em',
                    }}
                >
                    {props.farLinks.map((link) => (
                        <div
                            style={{
                                display: 'flex',
                                flexFlow: 'row nowrap',
                                alignItems: 'center',
                                gap: '4px',
                                color: 'white',
                                borderBottom: '2px solid white',
                                cursor: 'pointer',
                            }}
                            key={link.to}
                        >
                            <Link
                                to={link.to}
                                style={{
                                    color: 'inherit',
                                    textDecoration: 'none',
                                }}
                            >
                                {link.icon && (
                                    <Icon
                                        iconName={link.icon}
                                        style={{ marginRight: '4px' }}
                                    />
                                )}
                                {link.name}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
