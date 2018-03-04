import React from 'react';
import { shallow } from 'enzyme';
import Field from '../src/Field';

const noop = () => {};

describe('<Field>', () => {
  const formera = {
    registerField: jest.fn(),
    unregisterField: jest.fn(),
    handleFieldChange: jest.fn(),
    handleFieldBlur: jest.fn(),
    handleFieldFocus: jest.fn(),
  };

  it('should warn if not used inside a <Formera>', () => {
    const oldConsole = console;
    global.console = { error: jest.fn() };

    shallow(<Field name="myField" component={noop} />);
    expect(console.error).toHaveBeenCalledWith('Warning: Field must be used inside of a Formera component');
    global.console = oldConsole;
  });

  it('registers itself on mount', () => {
    const field = shallow(<Field name="myField" component={noop} />, { context: { formera } });
    expect(formera.registerField).toHaveBeenCalledWith(field.instance().field);
  });

  it('unregisters itself on unmount', () => {
    const field = shallow(<Field name="myField" component={noop} />, { context: { formera } });
    const fieldInstance = field.instance();
    field.unmount();
    expect(formera.unregisterField).toHaveBeenCalledWith(fieldInstance.field);
  });

  it("no initial value gets converted to empty string ''", () => {
    const field = shallow(<Field name="anotherfield" component={noop} />, { context: { formera } });
    expect(field.state().value).toBe('');
  });

  it('gets value from <Formera>', () => {
    const field = shallow(<Field name="myField" component={noop} />, {
      context: {
        formera: {
          ...formera,
          values: {
            myField: 'got this value',
          },
        },
      },
    });

    expect(field.state().value).toBe('got this value');
  });

  it('should focus, change and blur', () => {
    const mockedInput = jest.fn(({ input }) => <input {...input} />);

    const field = shallow(<Field name="field name" render={mockedInput} />, { context: { formera } });
    const fieldAPI = field.instance().field;
    expect(mockedInput).toHaveBeenCalled();

    const dom = field.find('input');

    dom.simulate('focus');
    expect(formera.handleFieldFocus).toHaveBeenCalledWith(fieldAPI);

    const changeEvent = { target: { value: 'hello!', type: 'change' } };
    dom.simulate('change', changeEvent);
    expect(formera.handleFieldChange).toHaveBeenCalledWith(fieldAPI, 'hello!');

    dom.simulate('blur');
    expect(formera.handleFieldBlur).toHaveBeenCalledWith(fieldAPI);
  });

  it('should render checkboxes with checked prop', () => {
    const mockedInput = jest.fn(({ input }) => <input {...input} />);

    const Form = () => (
      <form>
        <Field name="foo" type="checkbox" value="a" render={mockedInput} />
        <Field name="foo" type="checkbox" value="d" render={mockedInput} />
      </form>
    );
    const context = { context: { formera: { ...formera, values: { foo: 'd' } } } };
    const field = shallow(<Form />, context);
    const inputs = field.find(Field).map(node => node.dive(context).find('input'));

    expect(inputs[0].props().checked).toBe(false);
    expect(inputs[1].props().checked).toBe(true);
  });

  it('should render radio buttons with check prop', () => {
    const mockedInput = jest.fn(({ input }) => <input {...input} />);

    const Form = () => (
      <form>
        <Field name="foo" type="radio" value="a" render={mockedInput} />
        <Field name="foo" type="radio" value="d" render={mockedInput} />
      </form>
    );

    const context = { context: { formera: { ...formera, values: { foo: 'd' } } } };
    const field = shallow(<Form />, context);
    const inputs = field.find(Field).map(node => node.dive(context).find('input'));

    expect(inputs[0].props().checked).toBe(false);
    expect(inputs[1].props().checked).toBe(true);
  });
});
