const headerColumns = [
  "Created_DT",
  "Modifed_DT",
  "Entity",
  "Operating status",
  "Legal name",
  "DBA name",
  "Physical address",
  "Phone",
  "DOT",
  "MC/MX/FF",
  "Power units",
  "Out of service date",
];
const COLUMNS_TO_INCLUDE = [
  "created_dt",
  "data_source_modified_dt",
  "entity_type",
  "operating_status",
  "legal_name",
  "dba_name",
  "physical_address",
  "phone",
  "usdot_number",
  "mc_mx_ff_number",
  "power_units",
  "out_of_service_date",
];


export const formatColumnName = (name: string) => {
  // Remove underscores and capitalize first letter of each word
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export { COLUMNS_TO_INCLUDE, headerColumns };
