import { Icon } from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './Done.module.scss';


export const Done: React.FC = () => {
	return (<div id='done-animation' className={styles.done}>
		<div className={styles['done-text']}>
			<Icon iconName='SkypeCheck' />
			<span>Feedback added!</span>
		</div>
	</div>);
}
