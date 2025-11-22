import { useState, useRef } from 'react';
import { Camera, X, Maximize2, Trash2 } from 'lucide-react';
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
    const { createTracker, deleteTracker } = useTrackerStore();
    const [isUploading, setIsUploading] = useState(false);
    const [compareMode, setCompareMode] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<TrackerEntry | null>(null);
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
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-white">Galeria de Evolução</h2>
                    <p className="text-sm text-zinc-400">Registre seu progresso visual</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCompareMode(!compareMode)}
                        className={`p-2 rounded-lg border transition-all ${compareMode
                            ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
                            : 'bg-dark-900 border-white/10 text-zinc-400 hover:text-white'
                            }`}
                        title="Modo Comparação"
                    >
                        <Maximize2 className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isUploading ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Camera className="h-5 w-5" />
                        )}
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

                    <div className="grid grid-cols-2 gap-4">
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
                            <div>
                                <p className="font-medium text-lg">
                                    {format(new Date(selectedPhoto.date), 'dd ')} de {' '}
                                    {format(new Date(selectedPhoto.date), 'MMMM, yyyy', { locale: ptBR })}
                                </p>
                            </div>
                            <button
                                onClick={() => handleDelete(selectedPhoto.id)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
