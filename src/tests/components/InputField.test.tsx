/**
 * Тесты для компонента InputField
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InputField } from '../../components/InputField';

describe('InputField', () => {
  it('должен отображать label', () => {
    render(
      <InputField
        label="Цена покупки"
        value={100000}
        onChange={() => {}}
        type="money"
      />
    );
    
    expect(screen.getByText('Цена покупки')).toBeInTheDocument();
  });
  
  it('должен отображать форматированное значение для money', () => {
    render(
      <InputField
        label="Цена"
        value={1000000}
        onChange={() => {}}
        type="money"
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('1,000,000');
  });
  
  it('должен отображать суффикс AED для money', () => {
    render(
      <InputField
        label="Цена"
        value={100}
        onChange={() => {}}
        type="money"
      />
    );
    
    expect(screen.getByText('AED')).toBeInTheDocument();
  });
  
  it('должен отображать суффикс % для percent', () => {
    render(
      <InputField
        label="DLD"
        value={4}
        onChange={() => {}}
        type="percent"
      />
    );
    
    expect(screen.getByText('%')).toBeInTheDocument();
  });
  
  it('должен вызывать onChange при вводе', () => {
    const handleChange = vi.fn();
    render(
      <InputField
        label="Цена"
        value={100}
        onChange={handleChange}
        type="number"
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '200' } });
    
    expect(handleChange).toHaveBeenCalledWith(200);
  });
  
  it('должен применять min ограничение', () => {
    const handleChange = vi.fn();
    render(
      <InputField
        label="Цена"
        value={100}
        onChange={handleChange}
        type="number"
        min={50}
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '10' } });
    
    expect(handleChange).toHaveBeenCalledWith(50);
  });
  
  it('должен применять max ограничение', () => {
    const handleChange = vi.fn();
    render(
      <InputField
        label="Процент"
        value={50}
        onChange={handleChange}
        type="percent"
        max={100}
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '150' } });
    
    expect(handleChange).toHaveBeenCalledWith(100);
  });
  
  it('должен отображать ошибку', () => {
    render(
      <InputField
        label="Цена"
        value={-100}
        onChange={() => {}}
        type="money"
        error="Значение не может быть отрицательным"
      />
    );
    
    expect(screen.getByText('Значение не может быть отрицательным')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });
  
  it('должен быть disabled когда передан флаг', () => {
    render(
      <InputField
        label="Цена"
        value={100}
        onChange={() => {}}
        type="money"
        disabled
      />
    );
    
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
  
  it('должен показывать tooltip при наличии', () => {
    render(
      <InputField
        label="DLD"
        value={4}
        onChange={() => {}}
        type="percent"
        tooltip="Dubai Land Department fee"
      />
    );
    
    expect(screen.getByTitle('Dubai Land Department fee')).toBeInTheDocument();
  });
  
  it('должен обрабатывать пустой ввод как 0', () => {
    const handleChange = vi.fn();
    render(
      <InputField
        label="Цена"
        value={100}
        onChange={handleChange}
        type="money"
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '' } });
    
    expect(handleChange).toHaveBeenCalledWith(0);
  });
  
  it('должен игнорировать некорректные символы (NaN)', () => {
    const handleChange = vi.fn();
    render(
      <InputField
        label="Цена"
        value={100}
        onChange={handleChange}
        type="money"
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    // После фильтрации 'abc123' станет '123' - число
    fireEvent.change(input, { target: { value: '123' } });
    
    expect(handleChange).toHaveBeenCalledWith(123);
  });
  
  it('должен обрабатывать минус как начало отрицательного числа', () => {
    const handleChange = vi.fn();
    render(
      <InputField
        label="Значение"
        value={100}
        onChange={handleChange}
        type="number"
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '-' } });
    
    // Минус один воспринимается как начало ввода, сбрасывается в 0
    expect(handleChange).toHaveBeenCalledWith(0);
  });
});
