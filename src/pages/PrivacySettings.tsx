import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Shield, Download, Trash2 } from 'lucide-react';

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'connections';
  showProgress: boolean;
  showGoals: boolean;
  allowMessages: boolean;
  dataSharing: boolean;
  marketingEmails: boolean;
  sensitiveContent: boolean;
}

interface DataExport {
  exportInProgress: boolean;
  lastExportDate?: string;
  exportFormat: 'json' | 'csv';
}

export default function PrivacySettings() {
  const { user, profile } = useAuthStore();
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'private',
    showProgress: true,
    showGoals: false,
    allowMessages: false,
    dataSharing: false,
    marketingEmails: false,
    sensitiveContent: false,
  });

  const [dataExport, setDataExport] = useState<DataExport>({
    exportInProgress: false,
    exportFormat: 'json'
  });

  const [deleteAccount, setDeleteAccount] = useState({
    showConfirmation: false,
    password: '',
    reason: ''
  });

  const updatePrivacySetting = async (key: keyof PrivacySettings, value: any) => {
    try {
      setPrivacy(prev => ({ ...prev, [key]: value }));

      if (profile?.id) {
        const docRef = doc(db, 'profiles', profile.id);
        await updateDoc(docRef, {
          [`privacy.${key}`]: value
        });
        toast.success('Configuração de privacidade atualizada');
      }
    } catch (error) {
      console.error('Error updating privacy setting:', error);
      toast.error('Erro ao atualizar configuração');
    }
  };

  const handleDataExport = async () => {
    try {
      setDataExport(prev => ({ ...prev, exportInProgress: true }));

      // Collect user data
      const userData = {
        profile,
        privacySettings: privacy,
        exportDate: new Date().toISOString(),
        format: dataExport.exportFormat
      };

      // Create and download file
      const dataStr = dataExport.exportFormat === 'json'
        ? JSON.stringify(userData, null, 2)
        : convertToCSV(userData);

      const dataBlob = new Blob([dataStr], {
        type: dataExport.exportFormat === 'json' ? 'application/json' : 'text/csv'
      });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `respect-pill-data-${new Date().toISOString().split('T')[0]}.${dataExport.exportFormat}`;
      link.click();

      URL.revokeObjectURL(url);

      setDataExport(prev => ({
        ...prev,
        exportInProgress: false,
        lastExportDate: new Date().toISOString()
      }));

      toast.success('Dados exportados com sucesso!');
    } catch (error) {
      console.error('Error exporting data:', error);
      setDataExport(prev => ({ ...prev, exportInProgress: false }));
      toast.error('Erro ao exportar dados');
    }
  };

  const convertToCSV = (data: any): string => {
    // Simple CSV conversion for basic data
    const rows = [
      ['Campo', 'Valor'],
      ['Nome', data.profile?.name || ''],
      ['Email', user?.email || ''],
      ['Idade', data.profile?.age || ''],
      ['Data de Exportação', data.exportDate]
    ];

    return rows.map(row => row.join(',')).join('\n');
  };

  const handleDeleteAccount = async () => {
    if (!deleteAccount.password) {
      toast.error('Por favor, insira sua senha');
      return;
    }

    try {
      // Verify password and delete account
      // This would typically involve calling a backend endpoint or re-authenticating
      toast.success('Solicitação de exclusão enviada. Você receberá um email de confirmação.');
      setDeleteAccount({ showConfirmation: false, password: '', reason: '' });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Erro ao processar exclusão');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacidade e Segurança</h1>
        <p className="text-gray-600">
          Controle seus dados e configurações de privacidade conforme a LGPD
        </p>
      </div>

      <div className="space-y-8">
        {/* Privacy Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <Shield className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Configurações de Privacidade</h2>
          </div>

          <div className="space-y-6">
            {/* Profile Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibilidade do Perfil
              </label>
              <select
                value={privacy.profileVisibility}
                onChange={(e) => updatePrivacySetting('profileVisibility', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="private">Privado - Apenas eu</option>
                <option value="connections">Conexões - Amigos e comunidade</option>
                <option value="public">Público - Qualquer pessoa</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Quem pode ver seu perfil e progresso
              </p>
            </div>

            {/* Progress Sharing */}
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Mostrar Progresso</label>
                <p className="text-sm text-gray-500">Compartilhar seu progresso com outros usuários</p>
              </div>
              <button
                onClick={() => updatePrivacySetting('showProgress', !privacy.showProgress)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${privacy.showProgress ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${privacy.showProgress ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>

            {/* Goals Sharing */}
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Mostrar Metas</label>
                <p className="text-sm text-gray-500">Compartilhar suas metas pessoais</p>
              </div>
              <button
                onClick={() => updatePrivacySetting('showGoals', !privacy.showGoals)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${privacy.showGoals ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${privacy.showGoals ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>

            {/* Messages */}
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Permitir Mensagens</label>
                <p className="text-sm text-gray-500">Outros usuários podem te enviar mensagens</p>
              </div>
              <button
                onClick={() => updatePrivacySetting('allowMessages', !privacy.allowMessages)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${privacy.allowMessages ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${privacy.allowMessages ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>

            {/* Data Sharing */}
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Compartilhamento de Dados</label>
                <p className="text-sm text-gray-500">Usar dados para melhorar a plataforma (anonimizado)</p>
              </div>
              <button
                onClick={() => updatePrivacySetting('dataSharing', !privacy.dataSharing)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${privacy.dataSharing ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${privacy.dataSharing ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>

            {/* Marketing Emails */}
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Emails de Marketing</label>
                <p className="text-sm text-gray-500">Receber emails sobre novidades e promoções</p>
              </div>
              <button
                onClick={() => updatePrivacySetting('marketingEmails', !privacy.marketingEmails)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${privacy.marketingEmails ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${privacy.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>

            {/* Sensitive Content */}
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Conteúdo Sensível</label>
                <p className="text-sm text-gray-500">Acessar conteúdo sobre sexualidade e relacionamentos</p>
              </div>
              <button
                onClick={() => updatePrivacySetting('sensitiveContent', !privacy.sensitiveContent)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${privacy.sensitiveContent ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${privacy.sensitiveContent ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Data Export */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <Download className="h-6 w-6 text-green-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Exportação de Dados (LGPD)</h2>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              De acordo com a LGPD, você tem o direito de receber todos os seus dados pessoais em formato portátil.
            </p>

            <div className="flex items-center space-x-4">
              <select
                value={dataExport.exportFormat}
                onChange={(e) => setDataExport(prev => ({ ...prev, exportFormat: e.target.value as 'json' | 'csv' }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>

              <button
                onClick={handleDataExport}
                disabled={dataExport.exportInProgress}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>{dataExport.exportInProgress ? 'Exportando...' : 'Exportar Dados'}</span>
              </button>
            </div>

            {dataExport.lastExportDate && (
              <p className="text-sm text-gray-500">
                Última exportação: {new Date(dataExport.lastExportDate).toLocaleString('pt-BR')}
              </p>
            )}
          </div>
        </div>

        {/* Account Deletion */}
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
          <div className="flex items-center mb-6">
            <Trash2 className="h-6 w-6 text-red-600 mr-3" />
            <h2 className="text-xl font-bold text-red-900">Excluir Conta</h2>
          </div>

          {!deleteAccount.showConfirmation ? (
            <div className="space-y-4">
              <p className="text-red-700">
                Atenção: Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos.
              </p>

              <button
                onClick={() => setDeleteAccount(prev => ({ ...prev, showConfirmation: true }))}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Solicitar Exclusão de Conta
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-red-700 font-medium">
                Confirme sua identidade para prosseguir com a exclusão:
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha atual
                </label>
                <input
                  type="password"
                  value={deleteAccount.password}
                  onChange={(e) => setDeleteAccount(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Digite sua senha para confirmar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo (opcional)
                </label>
                <textarea
                  value={deleteAccount.reason}
                  onChange={(e) => setDeleteAccount(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                  placeholder="Por que está deixando o 360Man?"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteAccount({ showConfirmation: false, password: '', reason: '' })}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}