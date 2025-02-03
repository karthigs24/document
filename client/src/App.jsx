import { useState, useRef } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Card,
  ListGroup,
  ProgressBar,
} from 'react-bootstrap';
import { FaPlus, FaTrash, FaArrowLeft, FaArrowRight, FaUpload, FaTimes } from 'react-icons/fa';
import AddApplicant from './components/AddApplicant.jsx';
import AddDocument from './components/AddDocument.jsx';

function App() {
  const [applicants, setApplicants] = useState([]);
  const [currentApplicant, setCurrentApplicant] = useState(null);
  const [documents, setDocuments] = useState({});

  const [showApplicantModal, setShowApplicantModal] = useState(false);
  const [newApplicantName, setNewApplicantName] = useState('');

  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [newDocumentName, setNewDocumentName] = useState('');

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);
  const [currentApplicantIndex, setCurrentApplicantIndex] = useState(0);

  const fileInputRef = useRef(null);

  const handleAddApplicant = () => setShowApplicantModal(true);

  const handleSaveApplicant = () => {
    if (!newApplicantName.trim()) {
      alert('Please enter an applicant name.');
      return;
    }
    const newApplicant = { id: Date.now(), name: newApplicantName.trim() };
    setApplicants([...applicants, newApplicant]);
    setCurrentApplicant(newApplicant);
    setDocuments({ ...documents, [newApplicant.id]: [] });
    setNewApplicantName('');
    setShowApplicantModal(false);
  };

  const handleCloseApplicantModal = () => {
    setNewApplicantName('');
    setShowApplicantModal(false);
  };

  const handleApplicantSelect = (applicant) => {
    setCurrentApplicant(applicant);
    setCurrentDocumentIndex(0);
  };

  const handleDeleteApplicant = (applicantId) => {
    if (window.confirm('Are you sure you want to delete this applicant?')) {
      setApplicants(applicants.filter((applicant) => applicant.id !== applicantId));
      if (currentApplicant && currentApplicant.id === applicantId) {
        setCurrentApplicant(null);
      }
      const updatedDocuments = { ...documents };
      delete updatedDocuments[applicantId];
      setDocuments(updatedDocuments);
    }
  };

  const handleAddDocument = () => setShowDocumentModal(true);

  const handleSaveDocument = () => {
    if (!currentApplicant) {
      alert('No applicant selected.');
      return;
    }
    if (!newDocumentName.trim()) {
      alert('Please enter a document name.');
      return;
    }
    const newDocument = { id: Date.now(), name: newDocumentName.trim() };
    setDocuments({
      ...documents,
      [currentApplicant.id]: [...(documents[currentApplicant.id] || []), newDocument],
    });
    setNewDocumentName('');
    setShowDocumentModal(false);
  };

  const handleCloseDocumentModal = () => {
    setNewDocumentName('');
    setShowDocumentModal(false);
  };

  const handleDeleteDocument = (documentId) => {
    if (!currentApplicant) return;
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDocuments({
        ...documents,
        [currentApplicant.id]: documents[currentApplicant.id].filter(
          (doc) => doc.id !== documentId
        ),
      });
    }
  };

  const handleClear = (documentId) => {
    setDocuments((prevDocuments) => ({
      ...prevDocuments,
      [currentApplicant.id]: prevDocuments[currentApplicant.id].map((doc) =>
        doc.id === documentId ? { ...doc, file: null } : doc
      ),
    }));
  };

  const handleFileChange = (event, document) => {
    const file = event.target.files[0];
    console.log(`File selected for ${document.name}:`, file);

    setDocuments((prevDocuments) => ({
      ...prevDocuments,
      [currentApplicant.id]: prevDocuments[currentApplicant.id].map((doc) =>
        doc.id === document.id ? { ...doc, file: file } : doc
      ),
    }));
  };

  const handleFileUpload = (document) => {
    if (!document.file) {
      alert('Please select a file to upload.');
      return;
    }

    const file = document.file;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    fetch('/your-api-endpoint', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('File uploaded successfully:', data);
        alert(`File "${document.name}" uploaded!`);
      })
      .catch((error) => {
        console.error('Error uploading file:', error);
        alert(`Error uploading file: ${error.message}`);
      })
      .finally(() => {
        setUploading(false);
        setUploadProgress(0);
      });

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setUploading(false);
        setUploadProgress(0);
      }
    }, 200);
  };

  const handleFileDrop = (event, document) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      console.log(`File dropped for ${document.name}:`, file);

      setDocuments((prevDocuments) => ({
        ...prevDocuments,
        [currentApplicant.id]: prevDocuments[currentApplicant.id].map((doc) =>
          doc.id === document.id ? { ...doc, file: file } : doc
        ),
      }));
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleNextDocument = () => {
    if (
      currentApplicant &&
      documents[currentApplicant.id] &&
      currentDocumentIndex < documents[currentApplicant.id].length - 1
    ) {
      setCurrentDocumentIndex(currentDocumentIndex + 1);
    }
  };

  const handleBackDocument = () => {
    if (currentApplicant && currentDocumentIndex > 0) {
      setCurrentDocumentIndex(currentDocumentIndex - 1);
    }
  };

  const handleNextApplicant = () => {
    if (currentApplicantIndex < applicants.length - 1) {
      setCurrentApplicantIndex(currentApplicantIndex + 1);
      setCurrentApplicant(applicants[currentApplicantIndex + 1]);
      setCurrentDocumentIndex(0);
    }
  };

  const handleBackApplicant = () => {
    if (currentApplicantIndex > 0) {
      setCurrentApplicantIndex(currentApplicantIndex - 1);
      setCurrentApplicant(applicants[currentApplicantIndex - 1]);
      setCurrentDocumentIndex(0);
    }
  };

  return (
    <Container>
      <Row className="align-items-center justify-content-between mb-3">
        <Col>
          <h1 className="text-primary">Document Upload</h1>
        </Col>
        <Col xs="auto">
          <Button onClick={handleAddApplicant} variant="primary">
            <FaPlus /> Add Applicant
          </Button>
        </Col>
      </Row>

      <Row>
        <Col md={3}>
          <h2 className="text-secondary">Applicants</h2>
          <ListGroup>
            {applicants.map((applicant) => (
              <ListGroup.Item
                key={applicant.id}
                active={currentApplicant && currentApplicant.id === applicant.id}
                action
                onClick={() => handleApplicantSelect(applicant)}
                className="d-flex justify-content-between align-items-center"
              >
                {applicant.name}
                <Button
                  variant="link"
                  className="text-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteApplicant(applicant.id);
                  }}
                >
                  <FaTrash />
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>

        <Col md={9}>
          {currentApplicant && (
            <Card className="document-section mb-4">
              <Card.Header>
                <Row className="align-items-center">
                  <Col>
                    <h2 className="text-primary mb-0">{currentApplicant.name} - Documents</h2>
                  </Col>
                  <Col xs="auto">
                    <Button onClick={handleAddDocument} variant="primary">
                      <FaPlus /> Add Document
                    </Button>
                  </Col>
                </Row>
              </Card.Header>
              <Card.Body>
                {documents[currentApplicant.id] && documents[currentApplicant.id].length > 0 ? (
                  documents[currentApplicant.id].map((document, docIndex) => (
                    <Card
                      key={document.id}
                      className={`mb-3 ${currentDocumentIndex === docIndex ? 'active-document' : ''}`}
                      style={{
                        backgroundColor: currentDocumentIndex === docIndex ? '#f0f0f0' : 'transparent',
                        padding: '10px',
                        borderRadius: '5px',
                      }}
                    >
                      <Card.Body>
                        <Row className="justify-content-center">
                          <Col md={8}>
                            <Form.Group>
                              <Form.Label htmlFor={`fileInput-${currentApplicant.id}-${document.id}`}>
                                {document.name}
                              </Form.Label>
                              <div
                                className="border p-3 rounded d-flex align-items-center justify-content-center bg-light"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleFileDrop(e, document)}
                                style={{ cursor: 'pointer' }}
                              >
                                <Form.Control
                                  type="file"
                                  onChange={(e) => handleFileChange(e, document)}
                                  disabled={uploading}
                                  style={{ display: 'none' }}
                                  id={`fileInput-${currentApplicant.id}-${document.id}`}
                                  ref={fileInputRef}
                                />
                                <label htmlFor={`fileInput-${currentApplicant.id}-${document.id}`} className="text-center">
                                  <p className="m-0">Drag and Drop files here</p>
                                  <p className="m-0">Or</p>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => {
                                      if (fileInputRef.current) {
                                        fileInputRef.current.click();
                                      }
                                    }}
                                  >
                                    Choose File
                                  </Button>
                                </label>
                              </div>

                              <div className="mt-2 d-flex justify-content-end">
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => handleFileUpload(document)}
                                  disabled={uploading || !document.file}
                                  className="mr-2"
                                >
                                  <FaUpload /> Upload
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDeleteDocument(document.id)}
                                  disabled={uploading}
                                  className="mr-2"
                                >
                                  <FaTrash /> Delete
                                </Button>
                                <Button
                                  variant="warning"
                                  size="sm"
                                  onClick={() => handleClear(document.id)}
                                  disabled={uploading}
                                > <FaTimes />
                                  Clear
                                </Button>
                              </div>

                              {uploading && uploadProgress > 0 && (
                                <ProgressBar animated now={uploadProgress} label={`${uploadProgress}%`} className="mt-2" />
                              )}
                            </Form.Group>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))
                ) : (
                  <p>No documents added yet.</p>
                )}

                {documents[currentApplicant.id] && documents[currentApplicant.id].length > 1 && (
                  <div className="d-flex justify-content-between mt-3">
                    <Button
                      variant="secondary"
                      onClick={handleBackDocument}
                      disabled={currentDocumentIndex === 0}
                    >
                      <FaArrowLeft /> Back
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleNextDocument}
                      disabled={currentDocumentIndex === documents[currentApplicant.id].length - 1}
                    >
                      Next <FaArrowRight />
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {applicants.length > 1 && (
        <Row className="mt-3">
          <Col>
            <div className="d-flex justify-content-between">
              <Button
                variant="secondary"
                onClick={handleBackApplicant}
                disabled={currentApplicantIndex === 0}
              >
                <FaArrowLeft /> Back
              </Button>
              <Button
                variant="primary"
                onClick={handleNextApplicant}
                disabled={currentApplicantIndex === applicants.length - 1}
              >
                Next <FaArrowRight />
              </Button>
            </div>
          </Col>
        </Row>
      )}

      {/* Modals */}
      <AddApplicant
        show={showApplicantModal}
        handleClose={handleCloseApplicantModal}
        handleSave={handleSaveApplicant}
        newApplicantName={newApplicantName}
        setNewApplicantName={setNewApplicantName}
      />

      <AddDocument
        show={showDocumentModal}
        handleClose={handleCloseDocumentModal}
        handleSave={handleSaveDocument}
        newDocumentName={newDocumentName}
        setNewDocumentName={setNewDocumentName}
      />
    </Container>
  );
}

export default App;
