import React from 'react';
import warning from './warning';

export default function renderComponent(props, name) {
  const {
    render, children, component: Component, ...rest
  } = props;

  if (Component) {
    return <Component {...rest} render={render} />;
  }

  if (render) {
    return render({ ...rest, children }); // inject children back in
  }

  if (typeof children !== 'function') {
    warning(
      false,
      `Must specify either a render prop, a render function as children, or a component prop to ${
        name
      }`,
    );
    return null;
  }

  return children(rest);
}
