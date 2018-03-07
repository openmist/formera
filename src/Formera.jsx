import React from 'react';
import PropTypes from 'prop-types';
// todo: make deepEqual a peer dep?
import deepEqual from 'fast-deep-equal';

import warning from './helpers/warning';
import renderComponent from './helpers/renderComponent';
import isPromise from './helpers/isPromise';
import setIn from './helpers/setIn';
import getIn from './helpers/getIn';
import deepKeys from './helpers/deepKeys';

const createState = ({ initialValues }) => ({
  active: undefined,
  touched: {},
  values: initialValues,
  errors: {},
  validating: {},
  isSubmitting: false,
});

class Formera extends React.Component {
  static childContextTypes = {
    formera: PropTypes.object,
  };

  constructor(props) {
    super(props);

    const {
      render,
      children,
      component,
    } = props;

    warning(
      render || typeof children === 'function' || component,
      'Must specify either a render prop, a render function as children, or a component prop',
    );

    this.state = createState(props);
    this.resets = 0;
  }

  getChildContext() {
    return {
      formera: {
        ...this.state,
        registerField: this.registerField,
        unregisterField: this.unregisterField,

        handleFieldFocus: this.handleFieldFocus,
        handleFieldChange: this.handleFieldChange,
        handleFieldBlur: this.handleFieldBlur,
      },
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.enableReinitialize &&
      !deepEqual(nextProps.initialValues, this.props.initialValues)
    ) {
      this.resetForm(nextProps);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !deepEqual(nextState, this.state);
  }

  setErrors = (nextErrors = {}) => {
    const promises = [];
    const errorKeys = deepKeys(nextErrors);
    let errors = {};
    let validating = {};

    this.fields
      .filter(({ name }) => errorKeys.indexOf(name) === -1)
      .forEach(({ setError }) => setError(undefined, false));

    errorKeys.forEach((path) => {
      const error = getIn(nextErrors, path);
      const isAsync = isPromise(error);
      const fields = this.fields.filter(({ name }) => name === path);

      if (isAsync) {
        validating = setIn(path, getIn(this.state.validating, path, 0) + 1, validating);
        fields.forEach(({ setError }) => setError(undefined, 1));
        const { resets } = this;
        error.then((resolved) => {
          if (this.resets !== resets) {
            return;
          }

          fields.forEach(({ setError }) => setError(resolved, -1));

          this.setState((prevState) => {
            const count = getIn(prevState.validating, path) - 1;

            return {
              errors: setIn(path, resolved, prevState.errors),
              validating: setIn(path, count || undefined, prevState.validating),
            };
          });
        });

        promises.push(error);
      } else {
        errors = setIn(path, error, errors);
        fields.forEach(({ setError }) => setError(error, 0));
      }
    });

    this.setState({ errors, validating });

    return Promise.all(promises);
  };

  setSubmitting = (isSubmitting) => {
    this.setState({ isSubmitting });
  };

  /*
    I don't like react/sort-comp in this case, we should probably
    ignore that rule and sort manually
   */
  formeraActions = () => ({
    setErrors: this.setErrors,
    setSubmitting: this.setSubmitting,
    resetForm: this.resetForm,
  });

  resetForm = (props) => {
    this.resets += 1;
    this.setState(createState(props || this.props), () => {
      this.fields.forEach(field => field.reset());
    });
  };

  registerField = (field) => {
    this.fields.push(field);
  };

  unregisterField = (field) => {
    this.fields.splice(this.fields.indexOf(field), 1);
  };

  fields = [];

  runValidation = (fieldName) => {
    const { validate } = this.props;

    if (!validate) {
      return Promise.resolve();
    }

    return this.setErrors(validate(fieldName, { ...this.state }) || {});
  };

  handleReset = () => {
    if (this.props.onReset) {
      Promise.resolve(this.props.onReset(this.state, this.formeraActions()))
        .then(this.resetForm);
    } else {
      this.resetForm();
    }
  };

  handleSubmit = (event) => {
    if (event && event.preventDefault) {
      event.preventDefault();
    }

    this.submitForm();
  };

  handleFieldFocus = ({ name }) => {
    this.fields
      .filter(field => field.name === name)
      .forEach(({ setActive }) => setActive(true));

    this.setState({ active: name });
  };

  handleFieldChange = ({ name }, value) => {
    this.fields
      .filter(field => field.name === name)
      .forEach(({ setValue }) => setValue(value));

    this.setState(({ values }) => ({ values: setIn(name, value, values) }), () => {
      if (this.props.validateOnChange) {
        this.runValidation(name);
      }
    });
  };

  handleFieldBlur = ({ name }) => {
    this.fields
      .filter(field => field.name === name)
      .forEach(({ setActive, setTouched }) => {
        setActive(false);
        setTouched(true);
      });

    this.setState(({ touched }) => ({
      active: undefined,
      touched: setIn(name, true, touched),
    }), () => {
      if (this.props.validateOnBlur) {
        this.runValidation(name);
      }
    });
  };

  submitForm = () => {
    let touched = {};
    this.fields.forEach(({ name, setTouched }) => {
      setTouched(true);
      touched = setIn(name, true, touched);
    });

    const { reset } = this;

    this.setState({ touched, isSubmitting: true }, () => {
      this.runValidation().then(() => {
        if (this.reset !== reset) {
          // Abort if we've had a reset
          return;
        }

        const isValid = Object.keys(this.state.errors).length === 0;

        if (isValid) {
          const submit = this.props.onSubmit(this.state, this.formeraActions());

          Promise.resolve(submit).then(() => {
            this.setSubmitting(false);
          });
        } else {
          this.setSubmitting(false);
        }
      });
    });
  };

  render() {
    const {
      initialValues,
      onSubmit,
      validateOnChange,
      validateOnBlur,
      validate,
      ...props
    } = this.props;

    const renderProps = {
      ...this.state,
      handleSubmit: this.handleSubmit,
      handleReset: this.handleReset,
      ...props,
    };

    // console.log('%cRendering Formera', 'color: #ff0000;');
    return renderComponent({ ...renderProps }, 'Formera');
  }
}

Formera.propTypes = {
  render: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  component: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

  // config props
  enableReinitialize: PropTypes.bool,
  initialValues: PropTypes.shape(),
  onSubmit: PropTypes.func.isRequired,
  onReset: PropTypes.func,
  validateOnBlur: PropTypes.bool,
  validateOnChange: PropTypes.bool,
  validate: PropTypes.func,
};

Formera.defaultProps = {
  render: undefined,
  children: undefined,
  component: undefined,

  // config props
  enableReinitialize: false,
  initialValues: {},
  onReset: undefined,
  validateOnBlur: true,
  validateOnChange: true,
  validate: undefined,
};

export default Formera;
