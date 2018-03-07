import React from 'react';
import { shallow } from 'enzyme';
import Formera from '../src/Formera';

const noop = () => {};

describe('<Formera>', () => {
  it('should initialize', () => {
    const form = shallow(<Formera
      initialValues={{ firstName: 'Alexander' }}
      onSubmit={noop}
      component={noop}
    />);

    expect(form.find(noop).props().active).toBe(undefined);
    expect(form.find(noop).props().touched).toEqual({});
    expect(form.find(noop).props().values).toEqual({ firstName: 'Alexander' });
    expect(form.find(noop).props().errors).toEqual({});
    expect(form.find(noop).props().validating).toEqual({});
    expect(form.find(noop).props().isSubmitting).toBe(false);
    expect(form.find(noop).props().handleSubmit).toBe(form.instance().handleSubmit);
    expect(form.find(noop).props().handleReset).toEqual(form.instance().handleReset);
  });

  describe('field register', () => {
    const form = shallow(<Formera
      onSubmit={noop}
      component={noop}
    />);

    const formInstance = form.instance();

    const firstField = { name: 'First field' };
    const secondField = { name: 'Second field' };

    it('registers fields', () => {
      formInstance.registerField(firstField);
      expect(formInstance.fields.length).toBe(1);
      formInstance.registerField(secondField);
      expect(formInstance.fields.length).toBe(2);
      expect(formInstance.fields).toEqual([firstField, secondField]);
    });

    it('unregisters fields', () => {
      formInstance.unregisterField(firstField);
      expect(formInstance.fields.length).toBe(1);
      formInstance.unregisterField(secondField);
      expect(formInstance.fields.length).toBe(0);
    });
  });

  describe('Validator', () => {
    it('does not call setErrors without a validator', () => {
      const form = shallow(<Formera onSubmit={noop} component={noop} />);
      const formInstance = form.instance();
      const spy = jest.spyOn(formInstance, 'setErrors');

      formInstance.runValidation();

      expect(spy).not.toHaveBeenCalled();
    });

    it('calls setErrors with a validator', () => {
      const validator = jest.fn();
      const form = shallow(<Formera validate={validator} onSubmit={noop} component={noop} />);
      const formInstance = form.instance();
      const spy = jest.spyOn(formInstance, 'setErrors');

      formInstance.runValidation();

      expect(spy).toHaveBeenCalled();
    });

    it('provides field name argument to validator', () => {
      const validator = jest.fn();
      const form = shallow(<Formera onSubmit={noop} validate={validator} component={noop} />);
      const formInstance = form.instance();

      formInstance.runValidation('fieldName');
      expect(validator).toHaveBeenCalledWith('fieldName', formInstance.state);
    });

    it('it does not provide field name argument to validator if not passed to runValidation', () => {
      const validator = jest.fn();
      const form = shallow(<Formera onSubmit={noop} validate={validator} component={noop} />);
      const formInstance = form.instance();

      formInstance.runValidation();
      expect(validator).toHaveBeenCalledWith(undefined, formInstance.state);
    });

    it('runValidation returns a promise without a validator', () => {
      const form = shallow(<Formera onSubmit={noop} component={noop} />);
      return expect(form.instance().runValidation()).resolves.toBe(undefined);
    });

    it('runValidation returns a promise with a validator', () => {
      const validator = jest.fn();
      const form = shallow(<Formera onSubmit={noop} validate={validator} component={noop} />);
      return expect(form.instance().runValidation()).resolves.toEqual([]);
    });
  });

  describe('componentWillReceiveProps', () => {
    it('should resetForm if new initialValues', () => {
      const initialValues = { hello: 'hi' };
      const form = shallow(<Formera
        onSubmit={noop}
        component={noop}
        enableReinitialize
        initialValues={initialValues}
      />);
      const formInstance = form.instance();
      const spy = jest.spyOn(formInstance, 'resetForm');

      const nextProps = { initialValues: { hello: 'hello!' } };
      formInstance.componentWillReceiveProps(nextProps);
      expect(spy).toHaveBeenCalledWith(nextProps);
    });

    it('should not reset form if same initialValues', () => {
      const initialValues = { hello: 'hi' };
      const form = shallow(<Formera
        onSubmit={noop}
        component={noop}
        enableReinitialize
        initialValues={initialValues}
      />);
      const formInstance = form.instance();
      const spy = jest.spyOn(formInstance, 'resetForm');

      const nextProps = { initialValues: { hello: 'hi' } };
      formInstance.componentWillReceiveProps(nextProps);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not reset form if without enableReinitialize', () => {
      const initialValues = { hello: 'hi' };
      const form = shallow(<Formera
        onSubmit={noop}
        component={noop}
        initialValues={initialValues}
      />);
      const formInstance = form.instance();
      const spy = jest.spyOn(formInstance, 'resetForm');

      const nextProps = { initialValues: { hello: 'hi' } };
      formInstance.componentWillReceiveProps(nextProps);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('handlers', () => {
    describe('handleReset', () => {
      it('should call onReset with state and values when form is reset', () => {
        const onReset = jest.fn();
        const form = shallow(<Formera onSubmit={noop} onReset={onReset} component={noop} />);
        const state = form.state();
        const actions = form.instance().formeraActions();

        form.instance().handleReset();

        expect(onReset).toHaveBeenCalledWith(state, actions);
      });

      it('should not error if onReset is not a prop', () => {
        const form = shallow(<Formera onSubmit={noop} component={noop} />);
        const reset = () => {
          form.instance().handleReset();
        };

        expect(reset).not.toThrow();
      });

      it('changes back the state to what it was initially', () => {
        const form = shallow(<Formera onSubmit={noop} component={noop} />);
        const original = form.state();
        const newState = {
          touched: { field: true },
          errors: { field: 'we have an error' },
          values: { field: 'Value here' },
        };

        form.setState(newState);
        form.instance().handleReset();
        expect(form.state()).toEqual(original);
      });
    });

    describe('handleSubmit', () => {
      it('should call preventDefault', () => {
        const form = shallow(<Formera onSubmit={noop} component={noop} />);
        const preventDefault = jest.fn();
        form.instance().handleSubmit({ preventDefault });
        expect(preventDefault).toHaveBeenCalled();
      });

      it('should not error if called without an object', () => {
        const form = shallow(<Formera onSubmit={noop} component={noop} />);
        const submit = () => form.instance().handleSubmit();
        expect(submit).not.toThrow();
      });

      it('should not error if called without preventDefault', () => {
        const form = shallow(<Formera onSubmit={noop} component={noop} />);
        const submit = () => form.instance().handleSubmit({});
        expect(submit).not.toThrow();
      });

      it('should touch all fields', () => {
        const form = shallow(<Formera onSubmit={noop} component={noop} />);
        const formInstance = form.instance();

        const field = { name: 'toBeTouched', setTouched: jest.fn() };

        formInstance.registerField(field);
        expect(form.state().touched).toEqual({});

        formInstance.handleSubmit();
        expect(form.state().touched).toEqual({ toBeTouched: true });
        expect(field.setTouched).toHaveBeenCalled();
      });

      it('should call onSubmit if form has NO errors', () => {
        const submit = jest.fn();
        const form = shallow(<Formera onSubmit={submit} component={noop} />);
        expect(form.state().errors).toEqual({});

        form.instance().handleSubmit();

        return new Promise(resolve => setImmediate(resolve)).then(() => {
          expect(submit).toHaveBeenCalled();
        });
      });

      it('should not call onSubmit if form has errors', () => {
        const submit = jest.fn();
        const form = shallow(<Formera
          onSubmit={submit}
          validate={() => ({ error: 'no submission' })}
          component={noop}
        />);

        form.instance().handleSubmit();

        return new Promise(resolve => setImmediate(resolve)).then(() => {
          expect(submit).not.toHaveBeenCalled();
        });
      });

      it('should not call onSubmit if form was reset', () => {
        const submit = jest.fn();
        const promise = new Promise(resolve => resolve());
        const form = shallow(<Formera
          onSubmit={submit}
          validate={() => ({ error: promise })}
          component={noop}
        />);

        form.instance().handleSubmit();
        form.instance().resetForm();

        return promise.then(() => {
          expect(form.state().errors).toEqual({});
          expect(form.state().validating).toEqual({});
          expect(submit).not.toHaveBeenCalled();
        });
      });
    });

    describe('handleFieldFocus', () => {
      it('sets active field', () => {
        const form = shallow(<Formera
          onSubmit={noop}
          component={noop}
        />);
        const formInstance = form.instance();
        const field = {
          name: 'this-field-should-become-active',
          setActive: jest.fn(),
        };

        formInstance.registerField(field);
        formInstance.handleFieldFocus(field);

        expect(form.state().active).toBe('this-field-should-become-active');
        expect(field.setActive).toHaveBeenCalled();
      });
    });

    describe('handleFieldChange', () => {
      const field = {
        name: 'firstName',
        setValue: jest.fn(),
        setError: jest.fn(),
      };

      it('sets values state', () => {
        const form = shallow(<Formera
          initialValues={{ firstName: 'Alexander' }}
          onSubmit={noop}
          component={noop}
        />);
        const formInstance = form.instance();

        expect(form.state().values).toEqual({ firstName: 'Alexander' });

        formInstance.registerField(field);
        formInstance.handleFieldChange(field, 'changed from Alexander');

        expect(form.state().values).toEqual({ firstName: 'changed from Alexander' });
        expect(field.setValue).toHaveBeenCalled();
      });

      it('runs validation if validateOnChange is true', () => {
        const validator = jest.fn();
        const form = shallow(<Formera
          validateOnChange
          validate={validator}
          onSubmit={noop}
          component={noop}
        />);

        const formInstance = form.instance();

        formInstance.registerField(field);
        formInstance.handleFieldChange(field, 'change');
        expect(validator).toHaveBeenCalled();
      });

      it('does not run validation if validateOnChange is false', () => {
        const validator = jest.fn();

        const form = shallow(<Formera
          onSubmit={noop}
          validateOnChange={false}
          validate={validator}
          component={noop}
        />);
        const formInstance = form.instance();

        formInstance.registerField(field);
        formInstance.handleFieldChange(field, 'more changes');

        expect(validator).not.toHaveBeenCalled();
      });
    });

    describe('handleFieldBlur', () => {
      const field = {
        name: 'this-was-active',
        setActive: jest.fn(),
        setTouched: jest.fn(),
        setError: jest.fn(),
      };

      it('clears active', () => {
        const form = shallow(<Formera onSubmit={noop} component={noop} />);
        const formInstance = form.instance();
        form.setState({ active: 'this-was-active' });

        formInstance.registerField(field);
        formInstance.handleFieldBlur(field);

        expect(form.state().active).toBe(undefined);
        expect(field.setActive).toHaveBeenCalled();
      });

      it('sets touched', () => {
        const form = shallow(<Formera onSubmit={noop} component={noop} />);
        const formInstance = form.instance();
        form.setState({ active: 'this-was-active' });

        formInstance.registerField(field);
        formInstance.handleFieldBlur(field);

        expect(form.state().touched).toEqual({ 'this-was-active': true });
        expect(field.setTouched).toHaveBeenCalled();
      });

      it('validates on blur if validateOnBlur is true', () => {
        const validator = jest.fn();
        const form = shallow(<Formera
          validateOnBlur
          validate={validator}
          onSubmit={noop}
          component={noop}
        />);
        const formInstance = form.instance();

        formInstance.registerField(field);
        formInstance.handleFieldBlur(field);

        expect(validator).toHaveBeenCalled();
      });

      it('doesn\'t validate on blur if validateOnBlur is false', () => {
        const validator = jest.fn();
        const form = shallow(<Formera
          validateOnBlur={false}
          validate={validator}
          onSubmit={noop}
          component={noop}
        />);
        const formInstance = form.instance();

        formInstance.registerField(field);
        formInstance.handleFieldBlur(field);

        expect(validator).not.toHaveBeenCalled();
      });
    });
  });

  describe('setErrors', () => {
    it('handles sync errors', () => {
      const form = shallow(<Formera onSubmit={noop} component={noop} />);
      const formInstance = form.instance();
      const errors = { firstName: 'required', email: 'Not an email' };
      formInstance.setErrors(errors);

      expect(form.state().validating).toEqual({});
      expect(form.state().errors).toEqual(errors);
    });

    it('handles async errors', () => {
      const form = shallow(<Formera onSubmit={noop} component={noop} />);
      const formInstance = form.instance();

      const errors = { firstName: new Promise(resolve => resolve('With error')) };
      const promise = formInstance.setErrors(errors);

      expect(form.state().errors).toEqual({});
      expect(form.state().validating).toEqual({ firstName: 1 });

      return promise.then(() => {
        expect(form.state().errors).toEqual({ firstName: 'With error' });
        expect(form.state().validating).toEqual({});
      });
    });

    it('does not set error if async validation resolves with undefined', () => {
      const form = shallow(<Formera onSubmit={noop} component={noop} />);
      const formInstance = form.instance();

      const errors = { firstName: new Promise(resolve => resolve()) };
      const promise = formInstance.setErrors(errors);

      expect(form.state().errors).toEqual({});
      expect(form.state().validating).toEqual({ firstName: 1 });

      return promise.then(() => {
        expect(form.state().errors).toEqual({});
        expect(form.state().validating).toEqual({});
      });
    });

    it('handles validating counter the specific field', () => {
      const form = shallow(<Formera onSubmit={noop} component={noop} />);
      const formInstance = form.instance();

      const first = formInstance.setErrors({ firstName: new Promise(resolve => resolve('error')) });
      const second = formInstance.setErrors({ firstName: new Promise(resolve => setImmediate(() => resolve('other error'))) });

      expect(form.state().errors).toEqual({});
      expect(form.state().validating).toEqual({ firstName: 2 });

      return first.then(() => {
        expect(form.state().errors).toEqual({ firstName: 'error' });
        expect(form.state().validating).toEqual({ firstName: 1 });

        return second.then(() => {
          expect(form.state().errors).toEqual({ firstName: 'other error' });
          expect(form.state().validating).toEqual({});
        });
      });
    });

    it('clears existing errors', () => {
      const existingErrors = { existingError: 'this error is going to be cleared' };
      const form = shallow(<Formera onSubmit={noop} component={noop} />);
      const formInstance = form.instance();

      form.setState({ errors: existingErrors });
      expect(form.state().errors).toEqual(existingErrors);

      formInstance.setErrors({ name: 'new error' });
      expect(form.state().errors).toEqual({ name: 'new error' });

      formInstance.setErrors({});
      expect(form.state().errors).toEqual({});

      form.setState({ errors: { more: 'errors' } });
      expect(form.state().errors).toEqual({ more: 'errors' });

      formInstance.setErrors();
      expect(form.state().errors).toEqual({});
    });

    it('can handle complicated/nested errors', () => {
      const form = shallow(<Formera onSubmit={noop} component={noop} />);
      const formInstance = form.instance();

      expect(form.state().errors).toEqual({});

      let errors = { deep: { nested: { error: 'required', andAnother: 'error' } } };
      formInstance.setErrors(errors);
      expect(form.state().errors).toEqual(errors);

      // clear one error by setting the first one again
      errors = { deep: { nested: { error: 'required' } } };
      formInstance.setErrors(errors);
      expect(form.state().errors).toEqual(errors);

      errors = { deep: { nested: { errors: { sync: 'error', async: new Promise(resolve => resolve(':(')) } } } };
      const promise = formInstance.setErrors(errors);
      expect(form.state().errors).toEqual({ deep: { nested: { errors: { sync: 'error' } } } });
      expect(form.state().validating).toEqual({ deep: { nested: { errors: { async: 1 } } } });

      return promise.then(() => {
        expect(form.state().errors).toEqual({ deep: { nested: { errors: { sync: 'error', async: ':(' } } } });
        expect(form.state().validating).toEqual({});
      });
    });

    it('should not set errors if form is reset', () => {
      const form = shallow(<Formera onSubmit={noop} component={noop} />);
      const formInstance = form.instance();

      const promise = formInstance.setErrors({ error: new Promise(resolve => resolve('we are not going to see this')) });
      expect(form.state().validating).toEqual({ error: 1 });
      expect(form.state().errors).toEqual({});

      formInstance.resetForm();

      expect(form.state().validating).toEqual({});
      expect(form.state().errors).toEqual({});

      return promise.then(() => {
        expect(form.state().validating).toEqual({});
        expect(form.state().errors).toEqual({});
      });
    });
  });

  describe('misc', () => {
    describe('setSubmitting', () => {
      it('sets submitting status', () => {
        const form = shallow(<Formera onSubmit={noop} component={noop} />);
        expect(form.state().isSubmitting).toEqual(false);
        form.instance().setSubmitting(true);
        expect(form.state().isSubmitting).toEqual(true);
      });
    });
  });
});
