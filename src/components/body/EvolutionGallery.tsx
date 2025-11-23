import { useState, useRef } from 'react';
import { Camera, X, Maximize2, Trash2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuthStore } from '../../stores/authStore';
import { useTrackerStore, TrackerEntry } from '../../stores/trackerStore';
import { uploadBodyPhoto } from '../../lib/storage';

interface EvolutionGalleryProps {
    photos: TrackerEntry[];
}

export function EvolutionGallery({ photos }: EvolutionGalleryProps) {
    const { user } = useAuthStore();
    const { createTracker, deleteTracker, updateTracker } = useTrackerStore();
    const [isUploading, setIsUploading] = useState(false);
    const [compareMode, setCompareMode] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<TrackerEntry | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editDate, setEditDate] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Compare Mode States
    const [beforePhoto, setBeforePhoto] = useState<TrackerEntry | null>(null);
    const [afterPhoto, setAfterPhoto] = useState<TrackerEntry | null>(null);


    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) {
            console.log('Upload cancelled: no file or user', { file: !!file, user: !!user });
            return;
        }

        console.log('Starting photo upload:', { fileName: file.name, fileSize: file.size, fileType: file.type });

        try {
            setIsUploading(true);
            console.log('Uploading to Firebase Storage...');
            const { url } = await uploadBodyPhoto(file, user.id);
            console.log('Upload successful, URL:', url);

            console.log('Creating tracker entry...');
            await createTracker({
                userId: user.id,
                type: 'body_photo',
                date: format(new Date(), 'yyyy-MM-dd'),
                value: {
                    photoUrl: url,
                    position: 'front' // Default to front, can be editable later
                },
                metadata: {
                    notes: ''
                }
            });
            console.log('Tracker created successfully!');

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error: any) {
            console.error('Error uploading photo:', error);
            const errorMessage = error?.message || 'Erro desconhecido';
            alert(`Erro ao fazer upload da foto: ${errorMessage}\n\nVerifique o console para mais detalhes.`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta foto?')) {
            await deleteTracker(id);
            if (selectedPhoto?.id === id) setSelectedPhoto(null);
        }
    };

    const handleUpdate = async () => {
        if (!selectedPhoto || !editDate) return;

        try {
            await updateTracker(selectedPhoto.id, {
                date: editDate
            });

            // Update local state to reflect change immediately if needed, 
            // though store subscription usually handles it.
            // We'll just close edit mode.
            setIsEditing(false);

            // Update selected photo date in local state to avoid flicker
            setSelectedPhoto({
                ...selectedPhoto,
                date: editDate
            });

        } catch (error) {
            console.error('Error updating photo:', error);
            alert('Erro ao atualizar data da foto.');
        }
    };

    const sortedPhotos = [...photos].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const handleCompareSelect = (photo: TrackerEntry) => {
        if (!beforePhoto) {
            setBeforePhoto(photo);
        } else if (!afterPhoto) {
            setAfterPhoto(photo);
        } else {
            // Reset if both selected
            setBeforePhoto(photo);
            setAfterPhoto(null);
        }
    };

    return (
        <div className="bg-dark-850 rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-white">Galeria de Evolução</h2>
                    <p className="text-sm text-zinc-400">Registre seu progresso visual</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => setCompareMode(!compareMode)}
                        className={`flex-1 sm:flex-none justify-center p-2 rounded-lg border transition-all flex items-center gap-2 ${compareMode
                            ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
                            : 'bg-dark-900 border-white/10 text-zinc-400 hover:text-white'
                            }`}
                        title="Modo Comparação"
                    >
                        <Maximize2 className="h-5 w-5" />
                        <span className="sm:hidden text-sm">Comparar</span>
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex-1 sm:flex-none justify-center p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isUploading ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Camera className="h-5 w-5" />
                        )}
                        <span className="sm:hidden text-sm">Adicionar</span>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                    />
                </div>
            </div>

            {/* Compare Mode UI */}
            {compareMode && (
                <div className="p-6 border-b border-white/10 bg-dark-900/50">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-medium">Modo Comparação</h3>
                        <button
                            onClick={() => {
                                setBeforePhoto(null);
                                setAfterPhoto(null);
                            }}
                            className="text-xs text-zinc-400 hover:text-white"
                        >
                            Limpar Seleção
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Before Photo */}
                        <div className="space-y-2">
                            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider text-center">Antes</p>
                            <div className="relative w-full aspect-[3/4] bg-black rounded-lg overflow-hidden border border-white/10">
                                {beforePhoto ? (
                                    <>
                                        <img
                                            src={beforePhoto.value.photoUrl}
                                            className="w-full h-full object-contain"
                                            alt="Before"
                                        />
                                        <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
                                            {format(new Date(beforePhoto.date), 'dd/MM/yyyy')}
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">
                                        Selecione abaixo
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* After Photo */}
                        <div className="space-y-2">
                            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider text-center">Depois</p>
                            <div className="relative w-full aspect-[3/4] bg-black rounded-lg overflow-hidden border border-white/10">
                                {afterPhoto ? (
                                    <>
                                        <img
                                            src={afterPhoto.value.photoUrl}
                                            className="w-full h-full object-contain"
                                            alt="After"
                                        />
                                        <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
                                            {format(new Date(afterPhoto.date), 'dd/MM/yyyy')}
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">
                                        Selecione abaixo
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Gallery Grid */}
            <div className="p-6">
                {photos.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500">
                        <Camera className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>Nenhuma foto registrada ainda.</p>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-red-400 hover:text-red-300 text-sm mt-2"
                        >
                            Adicionar primeira foto
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {sortedPhotos.map((photo) => {
                            const isSelected = compareMode && (beforePhoto?.id === photo.id || afterPhoto?.id === photo.id);
                            const selectionLabel = beforePhoto?.id === photo.id ? 'Antes' : afterPhoto?.id === photo.id ? 'Depois' : null;

                            return (
                                <div
                                    key={photo.id}
                                    className={`relative aspect-[3/4] group rounded-lg overflow-hidden border cursor-pointer transition-all ${isSelected
                                        ? 'border-red-500 ring-2 ring-red-500/20'
                                        : 'border-white/10 hover:border-white/30'
                                        }`}
                                    onClick={() => compareMode ? handleCompareSelect(photo) : setSelectedPhoto(photo)}
                                >
                                    <img
                                        src={photo.value.photoUrl}
                                        alt={`Evolução ${photo.date}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                        <p className="text-white text-xs font-medium">
                                            {format(new Date(photo.date), 'dd MMM yyyy', { locale: ptBR })}
                                        </p>
                                    </div>

                                    {selectionLabel && (
                                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold shadow-sm">
                                            {selectionLabel}
                                        </div>
                                    )}

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(photo.id);
                                        }}
                                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                        title="Excluir Foto"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Full Screen Modal */}
            {selectedPhoto && !compareMode && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
                    <button
                        onClick={() => setSelectedPhoto(null)}
                        className="absolute top-4 right-4 p-2 text-white/50 hover:text-white"
                    >
                        <X className="h-8 w-8" />
                    </button>

                    <div className="max-w-4xl w-full max-h-[90vh] flex flex-col">
                        <img
                            src={selectedPhoto.value.photoUrl}
                            alt="Full view"
                            className="w-full h-full object-contain rounded-lg bg-black"
                        />
                        <div className="mt-4 flex justify-between items-center text-white">
                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        value={editDate}
                                        onChange={(e) => setEditDate(e.target.value)}
                                        className="bg-dark-900 border border-white/20 rounded px-2 py-1 text-white text-sm"
                                    />
                                    <button
                                        onClick={handleUpdate}
                                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-sm transition-colors"
                                    >
                                        Salvar
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-3 py-1 bg-dark-800 hover:bg-dark-700 rounded text-sm transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div>
                                        <p className="font-medium text-lg">
                                            {format(new Date(selectedPhoto.date), 'dd ')} de {' '}
                                            {format(new Date(selectedPhoto.date), 'MMMM, yyyy', { locale: ptBR })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setEditDate(selectedPhoto.date);
                                            setIsEditing(true);
                                        }}
                                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-2"
                                        title="Editar Data"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                </div>
                            )}

                            {!isEditing && (
                                <button
                                    onClick={() => handleDelete(selectedPhoto.id)}
                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Excluir Foto"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
