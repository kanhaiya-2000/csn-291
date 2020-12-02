import { useState } from "react";

const Modify = (defaultValue) => {
  const [value, setValue] = useState(defaultValue);

  const onChange = (e) => {
    setValue(e.target.value);
    e.target.focus();
  };

  return { value, setValue, onChange };
};

export default Modify;