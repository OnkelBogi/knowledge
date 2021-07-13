import React, { useState } from "react";

import { Dropdown } from "react-bootstrap";

type OuterNodeExtrasProps = {
  displayConnections: DisplayConnections;
  onConnectionsChange: (displayConnections: DisplayConnections) => void;
  onRemove: () => void;
};

export function OuterNodeMenu({
  displayConnections,
  onConnectionsChange,
  onRemove
}: OuterNodeExtrasProps): JSX.Element {
  return (
    <div className="outer-node-menu">
      <button
        type="button"
        className="btn outer-node-menu-btn hover-black"
        onClick={onRemove}
      >
        <span className="iconsminds-remove danger" />
      </button>
      <Dropdown>
        <Dropdown.Toggle
          as="button"
          className="btn outer-node-menu-btn hover-black outer-node-menu-dropdown"
        >
          <span className="iconsminds-arrow-inside-gap" />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item
            active={displayConnections === "RELEVANT_SUBJECTS"}
            onSelect={() => onConnectionsChange("RELEVANT_SUBJECTS")}
          >
            Relevant Subjects
          </Dropdown.Item>
          <Dropdown.Item
            active={displayConnections === "RELEVANT_OBJECTS"}
            onSelect={() => onConnectionsChange("RELEVANT_OBJECTS")}
          >
            Relevant Objects
          </Dropdown.Item>
          <Dropdown.Item
            active={displayConnections === "CONTAINS_OBJECTS"}
            onSelect={() => onConnectionsChange("CONTAINS_OBJECTS")}
          >
            Contains
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}
