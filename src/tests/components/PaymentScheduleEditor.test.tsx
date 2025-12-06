/**
 * Тесты для компонента PaymentScheduleEditor
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaymentScheduleEditor } from '../../components/forms/PaymentScheduleEditor';
import type { PaymentScheduleItem } from '../../types/calculator';

const mockOnChange = vi.fn();

const emptySchedule: PaymentScheduleItem[] = [];

const sampleSchedule: PaymentScheduleItem[] = [
  { amount: 100000, date: '2025-06-01' },
  { amount: 200000, date: '2025-12-01' },
];

describe('PaymentScheduleEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен отображать заголовок с количеством платежей', () => {
    render(<PaymentScheduleEditor schedule={sampleSchedule} onChange={mockOnChange} />);
    expect(screen.getByText(/План платежей \(2\)/)).toBeInTheDocument();
  });

  it('должен отображать кнопку добавления', () => {
    render(<PaymentScheduleEditor schedule={emptySchedule} onChange={mockOnChange} />);
    // Кнопка содержит иконку Plus и текст "Добавить"
    expect(screen.getByRole('button', { name: /Добавить/ })).toBeInTheDocument();
  });

  it('должен показывать placeholder при пустом списке', () => {
    render(<PaymentScheduleEditor schedule={emptySchedule} onChange={mockOnChange} />);
    expect(screen.getByText(/Нет платежей/)).toBeInTheDocument();
  });

  it('должен добавлять новый платёж при клике на кнопку', () => {
    render(<PaymentScheduleEditor schedule={emptySchedule} onChange={mockOnChange} />);
    
    const addButton = screen.getByRole('button', { name: /Добавить/ });
    fireEvent.click(addButton);
    
    expect(mockOnChange).toHaveBeenCalledWith([{ amount: 10000, date: '' }]);
  });

  it('должен отображать все платежи', () => {
    render(<PaymentScheduleEditor schedule={sampleSchedule} onChange={mockOnChange} />);
    
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
  });

  it('должен удалять платёж при клике на кнопку удаления', () => {
    render(<PaymentScheduleEditor schedule={sampleSchedule} onChange={mockOnChange} />);
    
    // Теперь используется иконка X из lucide вместо символа ✕
    const deleteButtons = document.querySelectorAll('svg.lucide-x');
    expect(deleteButtons.length).toBeGreaterThan(0);
    // Кликаем на родительскую кнопку первой иконки
    const firstDeleteButton = deleteButtons[0].closest('button');
    if (firstDeleteButton) fireEvent.click(firstDeleteButton);
    
    // Должен удалить первый платёж, оставив второй
    expect(mockOnChange).toHaveBeenCalledWith([{ amount: 200000, date: '2025-12-01' }]);
  });

  it('должен обновлять сумму платежа', () => {
    render(<PaymentScheduleEditor schedule={sampleSchedule} onChange={mockOnChange} />);
    
    const amountInputs = screen.getAllByPlaceholderText('Сумма');
    fireEvent.change(amountInputs[0], { target: { value: '150000' } });
    
    expect(mockOnChange).toHaveBeenCalledWith([
      { amount: 150000, date: '2025-06-01' },
      { amount: 200000, date: '2025-12-01' },
    ]);
  });

  it('должен обновлять дату платежа', () => {
    const schedule = [
      { amount: 100000, date: '2025-06-01' },
      { amount: 200000, date: '2025-12-01' },
    ];
    render(<PaymentScheduleEditor schedule={schedule} onChange={mockOnChange} />);
    
    const dateInputs = screen.getAllByDisplayValue('2025-06-01');
    fireEvent.change(dateInputs[0], { target: { value: '2025-07-15' } });
    
    expect(mockOnChange).toHaveBeenCalledWith([
      { amount: 100000, date: '2025-07-15' },
      { amount: 200000, date: '2025-12-01' },
    ]);
  });

  it('должен показывать итоговую сумму', () => {
    const schedule = [
      { amount: 100000, date: '2025-06-01' },
      { amount: 200000, date: '2025-12-01' },
    ];
    render(<PaymentScheduleEditor schedule={schedule} onChange={mockOnChange} />);
    
    // 100000 + 200000 = 300000 AED
    expect(screen.getByText(/Итого по плану:/)).toBeInTheDocument();
  });

  it('не должен показывать итого при пустом списке', () => {
    render(<PaymentScheduleEditor schedule={emptySchedule} onChange={mockOnChange} />);
    expect(screen.queryByText(/Итого по плану:/)).not.toBeInTheDocument();
  });

  it('должен обрабатывать некорректную сумму как 0', () => {
    const schedule = [
      { amount: 100000, date: '2025-06-01' },
      { amount: 200000, date: '2025-12-01' },
    ];
    render(<PaymentScheduleEditor schedule={schedule} onChange={mockOnChange} />);
    
    const amountInputs = screen.getAllByPlaceholderText('Сумма');
    fireEvent.change(amountInputs[0], { target: { value: 'abc' } });
    
    expect(mockOnChange).toHaveBeenCalledWith([
      { amount: 0, date: '2025-06-01' },
      { amount: 200000, date: '2025-12-01' },
    ]);
  });

  it('должен корректно добавлять платёж к существующему списку', () => {
    const schedule = [
      { amount: 100000, date: '2025-06-01' },
      { amount: 200000, date: '2025-12-01' },
    ];
    render(<PaymentScheduleEditor schedule={schedule} onChange={mockOnChange} />);
    
    const addButton = screen.getByText(/Добавить/);
    fireEvent.click(addButton);
    
    expect(mockOnChange).toHaveBeenCalledWith([
      { amount: 100000, date: '2025-06-01' },
      { amount: 200000, date: '2025-12-01' },
      { amount: 10000, date: '' },
    ]);
  });
});
