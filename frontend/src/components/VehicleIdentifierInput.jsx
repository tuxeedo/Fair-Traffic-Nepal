import { useState } from 'react';
import { BLUEBOOK_HELP, REGISTRATION_HELP, normalizeRegistrationNumber, vehicleIdentifierErrors } from '../utils/vehicleIdentifiers';

export default function VehicleIdentifierInput({ name, value, onChange, error, id, originalValue }) {
  const [touched, setTouched] = useState(false);
  const registration = name === 'registration_number';
  const localError = vehicleIdentifierErrors({ [name]: value }, { [name]: originalValue })[name];
  const message = error || (touched && localError);
  const preview = registration ? normalizeRegistrationNumber(value) : null;
  return (
    <div className="form-group vehicle-identifier-field">
      <label className="form-label" htmlFor={id}>{registration ? 'Vehicle Registration / Number Plate' : 'Bluebook Document Number'}</label>
      <input id={id} name={name} className="form-input" type="text" value={value} onChange={event => onChange(event.target.value)} onBlur={() => setTouched(true)} required maxLength={registration ? 60 : 80} autoComplete="off" spellCheck={false} placeholder={registration ? 'बा २ प १२३४ or BA 2 PA 1234' : 'Copy the document number from your bluebook'} aria-invalid={Boolean(message)} aria-describedby={`${id}-help${message ? ` ${id}-error` : ''}`} />
      <p id={`${id}-help`} className="vehicle-field-help">{registration ? REGISTRATION_HELP : BLUEBOOK_HELP}</p>
      {message && <p id={`${id}-error`} className="vehicle-field-error" role="alert">{message}</p>}
      {preview && !message && <div className="vehicle-plate-preview"><span>Registration preview</span><strong>{preview}</strong></div>}
    </div>
  );
}
