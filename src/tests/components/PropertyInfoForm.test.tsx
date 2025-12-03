/**
 * Тесты для компонента PropertyInfoForm
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PropertyInfoForm } from '../../components/forms/PropertyInfoForm';
import { DEFAULT_PARAMS } from '../../types/calculator';

const mockOnParamChange = vi.fn();
const mockOnCoordinatesChange = vi.fn();

const defaultProps = {
  params: DEFAULT_PARAMS,
  coordinates: null,
  onParamChange: mockOnParamChange,
  onCoordinatesChange: mockOnCoordinatesChange,
};

describe('PropertyInfoForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен отображать заголовок формы', () => {
    render(<PropertyInfoForm {...defaultProps} />);
    expect(screen.getByText('Информация об объекте')).toBeInTheDocument();
  });

  it('должен отображать поле названия объекта', () => {
    render(<PropertyInfoForm {...defaultProps} />);
    expect(screen.getByLabelText('Название объекта')).toBeInTheDocument();
  });

  it('должен вызывать onParamChange при изменении названия', () => {
    render(<PropertyInfoForm {...defaultProps} />);
    const input = screen.getByLabelText('Название объекта');
    
    fireEvent.change(input, { target: { value: 'Test Property' } });
    
    expect(mockOnParamChange).toHaveBeenCalledWith('propertyName', 'Test Property');
  });

  it('должен отображать кнопки типа объекта', () => {
    render(<PropertyInfoForm {...defaultProps} />);
    
    expect(screen.getByText(/Апартаменты/)).toBeInTheDocument();
    expect(screen.getByText(/Вилла/)).toBeInTheDocument();
    expect(screen.getByText(/Таунхауз/)).toBeInTheDocument();
  });

  it('должен переключать тип объекта при клике', () => {
    render(<PropertyInfoForm {...defaultProps} />);
    
    const villaButton = screen.getByText(/Вилла/);
    fireEvent.click(villaButton);
    
    expect(mockOnParamChange).toHaveBeenCalledWith('propertyType', 'villa');
  });

  it('должен отображать поле площади участка только для villa/townhouse', () => {
    const villaParams = { ...DEFAULT_PARAMS, propertyType: 'villa' as const };
    render(<PropertyInfoForm {...defaultProps} params={villaParams} />);
    
    expect(screen.getByText(/Площадь участка/)).toBeInTheDocument();
  });

  it('не должен отображать площадь участка для apartment', () => {
    const apartmentParams = { ...DEFAULT_PARAMS, propertyType: 'apartment' as const };
    render(<PropertyInfoForm {...defaultProps} params={apartmentParams} />);
    
    expect(screen.queryByText(/Площадь участка/)).not.toBeInTheDocument();
  });

  it('должен отображать кнопки типа сделки', () => {
    render(<PropertyInfoForm {...defaultProps} />);
    
    expect(screen.getByText(/Вторичка/)).toBeInTheDocument();
    expect(screen.getByText(/Off-Plan/)).toBeInTheDocument();
  });

  it('должен переключать тип сделки на offplan', () => {
    render(<PropertyInfoForm {...defaultProps} />);
    
    const offplanButton = screen.getByText(/Off-Plan/);
    fireEvent.click(offplanButton);
    
    expect(mockOnParamChange).toHaveBeenCalledWith('dealType', 'offplan');
  });

  it('должен переключать тип сделки на secondary', () => {
    render(<PropertyInfoForm {...defaultProps} />);
    
    const secondaryButton = screen.getByText(/Вторичка/);
    fireEvent.click(secondaryButton);
    
    expect(mockOnParamChange).toHaveBeenCalledWith('dealType', 'secondary');
  });

  it('должен показывать подсказку для offplan режима', () => {
    const offplanParams = { ...DEFAULT_PARAMS, dealType: 'offplan' as const };
    render(<PropertyInfoForm {...defaultProps} params={offplanParams} />);
    
    expect(screen.getByText(/учитывается фактическая оплата/)).toBeInTheDocument();
  });

  it('не должен показывать подсказку для secondary режима', () => {
    const secondaryParams = { ...DEFAULT_PARAMS, dealType: 'secondary' as const };
    render(<PropertyInfoForm {...defaultProps} params={secondaryParams} />);
    
    expect(screen.queryByText(/учитывается фактическая оплата/)).not.toBeInTheDocument();
  });

  it('должен выделять активный тип объекта', () => {
    const apartmentParams = { ...DEFAULT_PARAMS, propertyType: 'apartment' as const };
    render(<PropertyInfoForm {...defaultProps} params={apartmentParams} />);
    
    const apartmentButton = screen.getByText(/Апартаменты/);
    expect(apartmentButton).toHaveClass('bg-blue-600');
  });

  it('должен выделять активный тип сделки', () => {
    const secondaryParams = { ...DEFAULT_PARAMS, dealType: 'secondary' as const };
    render(<PropertyInfoForm {...defaultProps} params={secondaryParams} />);
    
    const secondaryButton = screen.getByText(/Вторичка/);
    expect(secondaryButton).toHaveClass('bg-blue-600');
  });
});
