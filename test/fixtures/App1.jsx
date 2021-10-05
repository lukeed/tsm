import * as React from './mock';

/**
 * @typedef Props
 * @property {string} foo
 */

/**
 * @param {Props} props
 */
export default function App(props) {
	return <div className={props.foo}>hello world</div>;
}
