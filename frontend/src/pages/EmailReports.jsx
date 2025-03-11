import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { pendingEmailReportService } from '../services';
import { useAuthContext } from '../contexts/AuthContext';
import { Button, Table, Modal, Form, Select, TextArea, Spinner, Alert } from '../components/ui';
import { DashboardLayout } from '../layouts';

const EmailReports = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  const [emailReports, setEmailReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  
  const [rejectReason, setRejectReason] = useState("");
  const [convertFormData, setConvertFormData] = useState({
    title: "",
    description: "",
    status: "NEW",
    priority: "MEDIUM",
    apartmentId: ""
  });
  
  // Hämta e-postrapporter när komponenten laddas
  useEffect(() => {
    const fetchEmailReports = async () => {
      setLoading(true);
      try {
        const reports = await pendingEmailReportService.getAll();
        setEmailReports(reports);
        setError(null);
      } catch (err) {
        console.error("Fel vid hämtning av e-postrapporter:", err);
        setError("Kunde inte hämta e-postrapporter. Vänligen försök igen.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmailReports();
  }, []);
  
  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setShowDetailsModal(true);
  };
  
  const handleReject = (report) => {
    setSelectedReport(report);
    setShowRejectModal(true);
  };
  
  const handleConvert = (report) => {
    setSelectedReport(report);
    // Förifyll formuläret med data från rapporten
    setConvertFormData({
      title: report.requestComments ? `Felanmälan: ${report.requestComments.substring(0, 50)}...` : "Ny felanmälan",
      description: report.requestComments || "",
      status: "NEW",
      priority: "MEDIUM",
      apartmentId: ""
    });
    setShowConvertModal(true);
  };
  
  const submitReject = async () => {
    if (!rejectReason.trim()) {
      setError("Vänligen ange en anledning till avvisningen");
      return;
    }
    
    setLoading(true);
    try {
      await pendingEmailReportService.rejectEmailReport(
        selectedReport.id, 
        user.id, 
        rejectReason
      );
      
      // Uppdatera listan efter avvisning
      const updatedReports = emailReports.filter(report => report.id !== selectedReport.id);
      setEmailReports(updatedReports);
      setShowRejectModal(false);
      setRejectReason("");
    } catch (err) {
      setError("Kunde inte avvisa rapporten. Vänligen försök igen.");
    } finally {
      setLoading(false);
    }
  };
  
  const submitConvert = async () => {
    if (!convertFormData.title.trim() || !convertFormData.description.trim()) {
      setError("Titel och beskrivning är obligatoriska fält");
      return;
    }
    
    setLoading(true);
    try {
      await pendingEmailReportService.convertToTask(selectedReport.id, convertFormData);
      
      // Uppdatera listan efter konvertering
      const updatedReports = emailReports.filter(report => report.id !== selectedReport.id);
      setEmailReports(updatedReports);
      setShowConvertModal(false);
    } catch (err) {
      setError("Kunde inte konvertera rapporten till en uppgift. Vänligen försök igen.");
    } finally {
      setLoading(false);
    }
  };
  
  // Formatera datum
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('emailReports.title')}</h1>
        
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        
        {loading && !emailReports.length ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {emailReports.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <p className="text-gray-500">{t('emailReports.noReports')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>{t('emailReports.sender')}</Table.HeaderCell>
                      <Table.HeaderCell>{t('emailReports.receivedAt')}</Table.HeaderCell>
                      <Table.HeaderCell>{t('emailReports.subject')}</Table.HeaderCell>
                      <Table.HeaderCell>{t('emailReports.actions')}</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {emailReports.map((report) => (
                      <Table.Row key={report.id}>
                        <Table.Cell>{report.requestedBy ? report.requestedBy.email : 'felanmalan@duggalsfastigheter.se'}</Table.Cell>
                        <Table.Cell>{formatDate(report.requestedAt)}</Table.Cell>
                        <Table.Cell>{report.subject || t('emailReports.noSubject')}</Table.Cell>
                        <Table.Cell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="secondary" onClick={() => handleViewDetails(report)}>
                              {t('common.view')}
                            </Button>
                            <Button size="sm" variant="primary" onClick={() => handleConvert(report)}>
                              {t('emailReports.convert')}
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => handleReject(report)}>
                              {t('emailReports.reject')}
                            </Button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Modal för att visa detaljer */}
      {selectedReport && (
        <Modal 
          title={t('emailReports.details')}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('emailReports.sender')}</h3>
              <p>{selectedReport.requestedBy ? selectedReport.requestedBy.email : 'felanmalan@duggalsfastigheter.se'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('emailReports.receivedAt')}</h3>
              <p>{formatDate(selectedReport.requestedAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('emailReports.subject')}</h3>
              <p>{selectedReport.subject || t('emailReports.noSubject')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('emailReports.content')}</h3>
              <div className="border rounded p-3 mt-1 bg-gray-50 whitespace-pre-wrap">
                {selectedReport.requestComments || t('emailReports.noContent')}
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                {t('common.close')}
              </Button>
              <Button variant="primary" onClick={() => {
                setShowDetailsModal(false);
                handleConvert(selectedReport);
              }}>
                {t('emailReports.convert')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
      
      {/* Modal för att avvisa rapport */}
      <Modal
        title={t('emailReports.reject')}
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
      >
        <div className="space-y-4">
          <p>{t('emailReports.confirmReject')}</p>
          <Form>
            <Form.Group>
              <Form.Label htmlFor="rejectReason">{t('emailReports.rejectReason')}</Form.Label>
              <TextArea
                id="rejectReason"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t('emailReports.rejectReasonPlaceholder')}
              />
            </Form.Group>
          </Form>
          <div className="flex justify-end space-x-3 mt-4">
            <Button variant="secondary" onClick={() => setShowRejectModal(false)} disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" onClick={submitReject} disabled={loading}>
              {loading ? <Spinner size="sm" /> : t('emailReports.confirmReject')}
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Modal för att konvertera till uppgift */}
      <Modal
        title={t('emailReports.convert')}
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
      >
        <div className="space-y-4">
          <Form>
            <Form.Group>
              <Form.Label htmlFor="title">{t('task.title')}</Form.Label>
              <Form.Input
                id="title"
                value={convertFormData.title}
                onChange={(e) => setConvertFormData({...convertFormData, title: e.target.value})}
                placeholder={t('task.titlePlaceholder')}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label htmlFor="description">{t('task.description')}</Form.Label>
              <TextArea
                id="description"
                rows={4}
                value={convertFormData.description}
                onChange={(e) => setConvertFormData({...convertFormData, description: e.target.value})}
                placeholder={t('task.descriptionPlaceholder')}
              />
            </Form.Group>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Group>
                <Form.Label htmlFor="status">{t('task.status')}</Form.Label>
                <Select
                  id="status"
                  value={convertFormData.status}
                  onChange={(e) => setConvertFormData({...convertFormData, status: e.target.value})}
                >
                  <option value="NEW">{t('task.status.new')}</option>
                  <option value="IN_PROGRESS">{t('task.status.inProgress')}</option>
                  <option value="COMPLETED">{t('task.status.completed')}</option>
                </Select>
              </Form.Group>
              <Form.Group>
                <Form.Label htmlFor="priority">{t('task.priority')}</Form.Label>
                <Select
                  id="priority"
                  value={convertFormData.priority}
                  onChange={(e) => setConvertFormData({...convertFormData, priority: e.target.value})}
                >
                  <option value="LOW">{t('task.priority.low')}</option>
                  <option value="MEDIUM">{t('task.priority.medium')}</option>
                  <option value="HIGH">{t('task.priority.high')}</option>
                </Select>
              </Form.Group>
            </div>
            <Form.Group>
              <Form.Label htmlFor="apartmentId">{t('task.apartmentId')}</Form.Label>
              <Form.Input
                id="apartmentId"
                value={convertFormData.apartmentId}
                onChange={(e) => setConvertFormData({...convertFormData, apartmentId: e.target.value})}
                placeholder={t('task.apartmentIdPlaceholder')}
              />
            </Form.Group>
          </Form>
          <div className="flex justify-end space-x-3 mt-4">
            <Button variant="secondary" onClick={() => setShowConvertModal(false)} disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={submitConvert} disabled={loading}>
              {loading ? <Spinner size="sm" /> : t('emailReports.createTask')}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default EmailReports; 