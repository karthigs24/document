/* eslint-disable react/prop-types */
import { Modal, Button, Form } from 'react-bootstrap';

const AddApplicant = ({
  show,
  handleClose,
  handleSave,
  newApplicantName,
  setNewApplicantName,
}) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Applicant</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group controlId="applicantName">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter applicant name"
            value={newApplicantName}
            onChange={(e) => setNewApplicantName(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddApplicant;
