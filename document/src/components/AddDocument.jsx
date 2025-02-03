/* eslint-disable react/prop-types */
import { Modal, Button, Form } from 'react-bootstrap';

const AddDocument = ({
  show,
  handleClose,
  handleSave,
  newDocumentName,
  setNewDocumentName,
}) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Document</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group controlId="documentName">
          <Form.Label>Document Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter document name"
            value={newDocumentName}
            onChange={(e) => {
              setNewDocumentName(e.target.value);
              console.log('New Document Name:', e.target.value);
            }}
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

export default AddDocument;