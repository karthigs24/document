import { useState } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
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

  const handleAddApplicant = () => {
    setShowApplicantModal(true);
  };

  const handleSaveApplicant = () => {
    if (!newApplicantName.trim()) {
      alert('Please enter an applicant name.');
      return;
    }

    const newApplicant = {
      id: Date.now(),
      name: newApplicantName.trim(),
    };

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

  const handleAddDocument = () => {
    setShowDocumentModal(true);
  };

  const handleSaveDocument = () => {
    if (!currentApplicant) {
      alert('No applicant selected.');
      return;
    }

    if (!newDocumentName.trim()) {
      alert('Please enter a document name.');
      return;
    }

    const newDocument = {
      id: Date.now(),
      name: newDocumentName.trim(),
    };

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

  const handleFileChange = (event, document) => {
    const file = event.target.files[0];
    console.log(`File selected for ${document.name}:`, file);

    if (file) {
      // Handle file selection if needed
    }
  };

  const handleFileUpload = (file, document) => {
    setUploading(true);
    // Implement actual file upload logic here (using file)
    // ... (Your fetch or Axios upload code)

    // Simulate upload progress (remove when you have real upload)
    const intervalId = setInterval(() => {
      setUploadProgress((prevProgress) => {
        const newProgress = prevProgress + 20;
        if (newProgress >= 100) {
          clearInterval(intervalId);
          setUploading(false);
          setUploadProgress(0);
          console.log(`File uploaded for ${document.name}`);
          alert(`File uploaded for ${document.name}`);
        }
        return newProgress;
      });
    }, 500);
  };

  const handleFileDrop = (event, document) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      console.log(`File dropped for ${document.name}:`, file);
      handleFileUpload(file, document);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleNextDocument = () => {
    if (currentApplicant && documents[currentApplicant.id] && currentDocumentIndex < documents[currentApplicant.id].length - 1) {
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
          <h1>Document Upload</h1>
        </Col>
        <Col xs="auto">
          <Button onClick={handleAddApplicant} variant="primary">
            + Add Applicant
          </Button>
        </Col>
      </Row>

      <Row>
        <Col md={3}>
          <h2>Applicants</h2>
          {applicants.map((applicant) => (
            <div key={applicant.id} className="mb-2 d-flex align-items-center">
              <Button
                variant={
                  currentApplicant && currentApplicant.id === applicant.id
                    ? 'primary'
                    : 'outline-primary'
                }
                onClick={() => handleApplicantSelect(applicant)}
                className="flex-grow-1 text-left"
              >
                {applicant.name}
              </Button>
              <Button
                variant="danger"
                className="ml-2"
                onClick={() => handleDeleteApplicant(applicant.id)}
              >
                🗑️
              </Button>
            </div>
          ))}
        </Col>

        <Col md={9}>
          {currentApplicant && (
            <div
              className="document-section"
              style={{
                border: '1px solid #ccc',
                padding: '20px',
                marginBottom: '20px',
                borderRadius: '5px',
              }}
            >
              <Row className="align-items-center mb-3">
                <Col>
                  <h2>{currentApplicant.name} - Documents</h2>
                </Col>
                <Col xs="auto">
                  <Button onClick={handleAddDocument} variant="primary">
                    + Add Document
                  </Button>
                </Col>
              </Row>

              {documents[currentApplicant.id] && documents[currentApplicant.id].length > 0 ? (
                <div>
                  {documents[currentApplicant.id].map((document, docIndex) => (
                    <div
                      key={document.id}
                      className={`mb-3 ${currentDocumentIndex === docIndex ? 'active-document' : ''}`}
                      style={{
                        backgroundColor: currentDocumentIndex === docIndex ? '#f0f0f0' : 'transparent',
                        padding: '10px',
                        borderRadius: '5px',
                      }}
                    >
                      <Row className="align-items-center">
                        <Col md={8}>
                          <Form.Group>
                            <Form.Label htmlFor={`fileInput-<span class="math-inline">\{currentApplicant\.id\}\-</span>{document.id}`}>
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
                              />
                              <label htmlFor={`fileInput-${currentApplicant.id}-${document.id}`} className="text-center">
                                <p className="m-0">Drag and Drop files here</p>
                                <p className="m-0">Or</p>
                                <Button variant="primary" size="sm">
                                  Choose File
                                </Button>
                              </label>
                            </div>

                            <div className="mt-2 d-flex justify-content-end">
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => {
                                  document.getElementById(`fileInput-${currentApplicant.id}-${document.id}`).click();
                                }}
                                disabled={uploading}
                                className="mr-2"
                              >
                                Upload
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  // Handle cancel logic if needed
                                }}
                                disabled={uploading}
                              >
                                Cancel
                              </Button>
                            </div>

                            {uploading && uploadProgress > 0 && (
                              <div className="progress mt-2">
                                <div
                                  className="progress-bar progress-bar-striped progress-bar-animated"
                                  style={{ width: `${uploadProgress}%` }}
                                >
                                  {uploadProgress}%
                                </div>
                              </div>
                            )}
                          </Form.Group>
                        </Col>
                        <Col md={4} className="d-flex justify-content-end">
                          <Button
                            variant="danger"
                            onClick={() => handleDeleteDocument(document.id)}
                          >
                            🗑️
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  ))}

                  {documents[currentApplicant.id].length > 1 && (
                    <div className="d-flex justify-content-between mt-3">
                      <Button
                        variant="secondary"
                        onClick={handleBackDocument}
                        disabled={currentDocumentIndex === 0}
                      >
                        ← Back
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleNextDocument}
                        disabled={currentDocumentIndex === documents[currentApplicant.id].length - 1}
                      >
                        Next →
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p>No documents added yet.</p>
              )}
            </div>
          )}
        </Col>
      </Row>

      {applicants.length > 1 && ( // Conditional rendering for applicant buttons
        <Row className="mt-3">
          <Col>
            <div className="d-flex justify-content-between">
              <Button variant="secondary" onClick={handleBackApplicant} disabled={currentApplicantIndex === 0}>
                ← Back
              </Button>
              <Button variant="primary" onClick={handleNextApplicant} disabled={currentApplicantIndex === applicants.length - 1}>
                Next →
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