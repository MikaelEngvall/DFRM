import InterestGoogleDocsExport from '../components/InterestGoogleDocsExport';
import { Routes, Route } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Interest = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleFilterChange = (filter) => {
    // Implementation of handleFilterChange
  };

  const handleOpenAddModal = () => {
    // Implementation of handleOpenAddModal
  };

  return (
    <div className="flex flex-wrap gap-2 justify-between items-center pb-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => handleFilterChange('all')}
          active={filter === 'all'}
        >
          {t('interests.showAll')}
        </Button>
        <Button
          variant="outline"
          onClick={() => handleFilterChange('reviewed')}
          active={filter === 'reviewed'}
        >
          {t('interests.showReviewed')}
        </Button>
        <Button
          variant="outline"
          onClick={() => handleFilterChange('unreviewed')}
          active={filter === 'unreviewed'}
        >
          {t('interests.showUnreviewed')}
        </Button>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => navigate('/interests/export-to-google-docs')}
          className="mr-2"
        >
          Exportera till Google Docs
        </Button>
        <Button onClick={handleOpenAddModal}>
          {t('interests.addNew')}
        </Button>
      </div>
    </div>
  );
};

export default Interest; 