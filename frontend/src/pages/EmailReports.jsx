import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { pendingEmailReportService, userService } from '../services';
import { useAuthContext } from '../contexts/AuthContext';
import { Button, Table, Modal, Form, Select, TextArea, Spinner, Alert, DatePicker } from '../components/ui';
import { DashboardLayout } from '../layouts';

const EmailReports = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  const [emailReports, setEmailReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  const [rejectReason, setRejectReason] = useState("");
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    status: "NEW", // Väntande
    priority: "MEDIUM",
    apartmentId: "",
    assignedToUserId: "",
    dueDate: null
  });
  
  // Hämta e-postrapporter och användare när komponenten laddas
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Hämta alla e-postrapporter
        const reports = await pendingEmailReportService.getAll();
        setEmailReports(reports);
        
        // Hämta alla användare för tilldelning
        const usersData = await userService.getAllUsers();
        setUsers(usersData);
        
        setError(null);
      } catch (err) {
        console.error("Fel vid hämtning av data:", err);
        setError("Kunde inte hämta nödvändig data. Vänligen försök igen.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleRowClick = (report) => {
    setSelectedReport(report);
    // Förifyll formuläret med data från rapporten
    setTaskData({
      title: `${report.address || ''} ${report.apartment || ''}`.trim(),
      description: report.description || '',
      status: "NEW", // Väntande
      priority: "MEDIUM",
      apartmentId: report.apartment || "", // Förfyll med lägenhetsnummer om det finns
      assignedToUserId: "",
      dueDate: null
    });
    setShowDetailsModal(true);
  };
  
  const handleReject = () => {
    setShowDetailsModal(false);
    setShowRejectModal(true);
  };
  
  // Formatera månad och dag
  const formatMonthDay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Formatera som "månad dag" med dag i siffror, t.ex. "mars 15"
    const month = date.toLocaleString('sv-SE', { month: 'long' });
    const day = date.getDate();
    return `${month} ${day}`;
  };
  
  const submitTask = async () => {
    if (!taskData.title.trim() || !taskData.description.trim()) {
      setError("Titel och beskrivning är obligatoriska fält");
      return;
    }
    
    setLoading(true);
    try {
      // Konvertera status från frontend-format till backend-format
      const statusMap = {
        "NEW": "NEW", // Väntande
        "IN_PROGRESS": "IN_PROGRESS", // Pågående
        "NOT_FEASIBLE": "NOT_FEASIBLE", // Ej genomförbar
        "COMPLETED": "COMPLETED" // Avslutad
      };
      
      const taskDataToSend = {
        ...taskData,
        status: statusMap[taskData.status],
        assignedByUserId: user.id, // Den inloggade användaren är den som tilldelar uppgiften
      };
      
      await pendingEmailReportService.convertToTask(selectedReport.id, taskDataToSend);
      
      // Uppdatera listan efter konvertering
      const updatedReports = emailReports.filter(report => report.id !== selectedReport.id);
      setEmailReports(updatedReports);
      setShowDetailsModal(false);
    } catch (err) {
      setError("Kunde inte konvertera rapporten till en uppgift. Vänligen försök igen.");
    } finally {
      setLoading(false);
    }
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
                      <Table.HeaderCell>Från</Table.HeaderCell>
                      <Table.HeaderCell>Var</Table.HeaderCell>
                      <Table.HeaderCell>Vad</Table.HeaderCell>
                      <Table.HeaderCell>När</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {emailReports.map((report) => (
                      <Table.Row key={report.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleRowClick(report)}>
                        <Table.Cell>{report.name || 'Okänd'}</Table.Cell>
                        <Table.Cell>
                          {report.address ? `${report.address}${report.apartment ? ' lgh ' + report.apartment : ''}` : 'Ej angiven'}
                        </Table.Cell>
                        <Table.Cell>{report.description || 'Ingen beskrivning'}</Table.Cell>
                        <Table.Cell>{formatMonthDay(report.received)}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Modal för att visa detaljer och redigera */}
      {selectedReport && (
        <Modal 
          title="Väntande uppgift"
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Från</h3>
              <p>{selectedReport.name || 'Ej angiven'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Kontaktinformation</h3>
              <p>E-post: {selectedReport.email || 'Ej angiven'}</p>
              <p>Telefon: {selectedReport.phone || 'Ej angiven'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Adress</h3>
              <p>{selectedReport.address || 'Ej angiven'}{selectedReport.apartment ? `, lgh ${selectedReport.apartment}` : ''}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Beskrivning</h3>
              <div className="border rounded p-3 mt-1 bg-gray-50 whitespace-pre-wrap">
                {selectedReport.requestComments || 'Ingen beskrivning'}
              </div>
            </div>
            
            <Form>
              <Form.Group>
                <Form.Label htmlFor="title">Titel</Form.Label>
                <Form.Input
                  id="title"
                  value={taskData.title}
                  onChange={(e) => setTaskData({...taskData, title: e.target.value})}
                  placeholder="Ange titel för uppgiften"
                />
              </Form.Group>
              <Form.Group>
                <Form.Label htmlFor="description">Beskrivning</Form.Label>
                <TextArea
                  id="description"
                  rows={3}
                  value={taskData.description}
                  onChange={(e) => setTaskData({...taskData, description: e.target.value})}
                  placeholder="Ange beskrivning för uppgiften"
                />
              </Form.Group>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Group>
                  <Form.Label htmlFor="status">Status</Form.Label>
                  <Select
                    id="status"
                    value={taskData.status}
                    onChange={(e) => setTaskData({...taskData, status: e.target.value})}
                  >
                    <option value="NEW">Väntande</option>
                    <option value="IN_PROGRESS">Pågående</option>
                    <option value="NOT_FEASIBLE">Ej genomförbar</option>
                    <option value="COMPLETED">Avslutad</option>
                  </Select>
                </Form.Group>
                <Form.Group>
                  <Form.Label htmlFor="priority">Prioritet</Form.Label>
                  <Select
                    id="priority"
                    value={taskData.priority}
                    onChange={(e) => setTaskData({...taskData, priority: e.target.value})}
                  >
                    <option value="LOW">Låg</option>
                    <option value="MEDIUM">Medel</option>
                    <option value="HIGH">Hög</option>
                  </Select>
                </Form.Group>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Group>
                  <Form.Label htmlFor="apartmentId">Lägenhetsnummer</Form.Label>
                  <Form.Input
                    id="apartmentId"
                    value={taskData.apartmentId}
                    onChange={(e) => setTaskData({...taskData, apartmentId: e.target.value})}
                    placeholder="Ange lägenhetsnummer"
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label htmlFor="assignedToUserId">Tilldela till</Form.Label>
                  <Select
                    id="assignedToUserId"
                    value={taskData.assignedToUserId}
                    onChange={(e) => setTaskData({...taskData, assignedToUserId: e.target.value})}
                  >
                    <option value="">Välj användare</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </Select>
                </Form.Group>
              </div>
              
              <Form.Group>
                <Form.Label htmlFor="dueDate">Utförandedatum</Form.Label>
                <DatePicker
                  id="dueDate"
                  selected={taskData.dueDate}
                  onChange={(date) => setTaskData({...taskData, dueDate: date})}
                  placeholderText="Välj datum"
                  dateFormat="yyyy-MM-dd"
                />
              </Form.Group>
            </Form>
            
            <div className="flex justify-end space-x-3 mt-4">
              <Button variant="danger" onClick={handleReject} disabled={loading}>
                Avvisa
              </Button>
              <Button variant="primary" onClick={submitTask} disabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Godkänn'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
      
      {/* Modal för att avvisa rapport */}
      <Modal
        title="Avvisa uppgift"
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
      >
        <div className="space-y-4">
          <p>Är du säker på att du vill avvisa denna uppgift?</p>
          <Form>
            <Form.Group>
              <Form.Label htmlFor="rejectReason">Anledning till avvisning</Form.Label>
              <TextArea
                id="rejectReason"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ange anledning till avvisning"
              />
            </Form.Group>
          </Form>
          <div className="flex justify-end space-x-3 mt-4">
            <Button variant="secondary" onClick={() => setShowRejectModal(false)} disabled={loading}>
              Avbryt
            </Button>
            <Button variant="danger" onClick={submitReject} disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Avvisa'}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default EmailReports; 