// src/components/common/CreatableDropdown.js
import React from "react";
import CreatableSelect from "react-select/creatable";

const CreatableDropdown = ({ label, options, value, onChange, name }) => {
  const handleChange = (selectedOption) => {
    onChange(name, selectedOption?.value || "");
  };

  const formattedOptions = options.map((opt) => ({ label: opt, value: opt }));

  return (
    <div className="form-group">
      <label>{label}</label>
      <CreatableSelect
        isClearable
        options={formattedOptions}
        onChange={handleChange}
        value={value ? { label: value, value } : null}
        placeholder={`Select or create ${label.toLowerCase()}`}
      />
    </div>
  );
};

export default CreatableDropdown;
