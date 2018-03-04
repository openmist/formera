import React from 'react';
import PropTypes from 'prop-types';
import deepEqual from 'fast-deep-equal';
import warning from './helpers/warning';
import renderComponent from './helpers/renderComponent';
import getIn from './helpers/getIn';

const createState = ({ value }) => ({
  value: value || '',
  touched: false,
  active: false,
  error: undefined,
  validating: false,
});

class Field extends React.Component {
  static contextTypes = {
    formera: PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);

    const { formera } = context;

    warning(
      formera,
      'Field must be used inside of a Formera component',
    );

    if (formera) {
      this.formera = formera;

      this.state = createState({
        value: getIn(this.formera.values, props.name),
      });

      this.formera.registerField(this.field);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !deepEqual(nextState, this.state);
  }

  componentWillUnmount() {
    // console.log('this', this);
    this.formera.unregisterField(this.field);
  }

  setActive = (active) => {
    this.setState({ active });
  };

  setValue = (value) => {
    this.setState({ value });
  };

  setError = (error, validators) => {
    this.setState((prevState) => {
      let newValidating = (prevState.validating || 0) + validators;

      if (newValidating <= 0) {
        newValidating = false;
      }

      return {
        error,
        validating: newValidating,
      };
    });
  };

  setTouched = (touched) => {
    this.setState({ touched });
  };

  reset = () => {
    this.setState(createState({
      value: getIn(this.formera.values, this.props.name),
    }));
  };

  handleFocus = () => this.formera.handleFieldFocus(this.field);

  handleOnChange = (event) => {
    const { type, value, checked } = event.target;

    const val = /number|range/.test(type) ? parseFloat(value) : /checkbox/.test(type) ? checked : value;

    this.formera.handleFieldChange(this.field, val);
  };

  handleBlur = () => this.formera.handleFieldBlur(this.field);

  field = ({
    name: this.props.name,
    reset: this.reset,
    setActive: this.setActive,
    setTouched: this.setTouched,
    setValue: this.setValue,
    setError: this.setError,
  });

  render() {
    const {
      name,
      type,
      value: propsValue,
      ...props
    } = this.props;

    const { value, ...rest } = this.state;

    const input = {
      onChange: this.handleOnChange,
      onBlur: this.handleBlur,
      onFocus: this.handleFocus,
      value,
      type,
    };

    if (type === 'radio' || type === 'checkbox') {
      input.checked = value === propsValue;
      input.value = propsValue;
    }

    // console.log(`%cRendering Field(${name})`, 'color: #0000ff;');
    return renderComponent({ ...props, input, meta: { ...rest } }, `Field${name}`);
  }
}

Field.propTypes = {
  render: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  component: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

  // "config" props
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string,
};

Field.defaultProps = {
  render: undefined,
  children: undefined,
  component: undefined,

  type: undefined,
  value: undefined,
};

export default Field;
