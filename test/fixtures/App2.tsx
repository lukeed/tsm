/** @jsx React.createElement */
import * as React from './mock';

type Props = {
	foo: string;
}

export default function App(props: Props) {
	return <div className={ props.foo }>hello world</div>;
}
