import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, Calendar, MapPin, Users, Search, Filter, Loader2, AlertTriangle, Star, Mail, Link as LinkIcon, X } from 'lucide-react';


// import { Plus, Edit2, Trash2, Eye, Calendar, MapPin, Users, Search, Filter, Loader2, AlertTriangle, Star, Mail, Link as LinkIcon } from 'lucide-react';
import { EventsAPI } from '../../api/eventsAPI';
import { API_CONFIG, BASE_URL } from '../../api/api-config';
import EventsForm from '../../components/forms/EventsForm';


const ErrorAlert = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-red-400 hover:text-red-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", cancelText = "Cancel", isDestructive = false, loading = false, error = null }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {isDestructive && (
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <ErrorAlert error={error} />

          <div className="mb-6">
            <p className="text-gray-600">{message}</p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`w-full sm:w-auto px-4 py-2 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                isDestructive
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EventsManagement = () => {
  const [events, setEvents] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('All');
  const [featuredFilter, setFeaturedFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    eventId: null,
    eventTitle: '',
    loading: false,
    error: null
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const getErrorMessage = (error) => {
    if (typeof error === 'string') {
      const jsonMatch = error.match(/\{.*\}/);
      if (jsonMatch) {
        try {
          const parsedError = JSON.parse(jsonMatch[0]);
          return parsedError.message || error;
        } catch (e) {
          return error;
        }
      }
      return error;
    }
    
    if (error?.message) {
      if (typeof error.message === 'string' && error.message.includes('{')) {
        const jsonMatch = error.message.match(/\{.*\}/);
        if (jsonMatch) {
          try {
            const parsedError = JSON.parse(jsonMatch[0]);
            return parsedError.message || error.message;
          } catch (e) {
            return error.message;
          }
        }
      }
      return error.message;
    }
    
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error?.result === null && error?.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred';
  };

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    let attempts = 0;

    while (attempts < API_CONFIG.RETRY_ATTEMPTS) {
      try {
        const res = await EventsAPI.getAll();
        if (res.success) {
          setEvents(res.result || []);
          setLoading(false);
          return;
        } else {
          throw new Error(getErrorMessage(res));
        }
      } catch (err) {
        attempts += 1;
        setRetryCount(attempts);
        if (attempts < API_CONFIG.RETRY_ATTEMPTS) {
          await new Promise(r => setTimeout(r, API_CONFIG.RETRY_DELAY));
        } else {
          setError(getErrorMessage(err));
          setLoading(false);
        }
      }
    }
  };

  const openForm = (event = null) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingEvent(null);
  };

  const handleFormSuccess = () => {
    fetchEvents();
    closeForm();
  };

  const openViewModal = (event) => {
    setViewingEvent(event);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingEvent(null);
  };

  const deleteEvent = (id, eventTitle) => {
    setConfirmModal({
      isOpen: true,
      eventId: id,
      eventTitle,
      loading: false,
      error: null
    });
  };

  const confirmDeleteEvent = async () => {
    const { eventId } = confirmModal;
    setConfirmModal(prev => ({ ...prev, error: null, loading: true }));

    try {
      const res = await EventsAPI.delete(eventId);

      if (res.success) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        cancelDeleteEvent();
      } else {
        throw new Error(getErrorMessage(res));
      }
    } catch (error) {
      setConfirmModal(prev => ({ ...prev, error: getErrorMessage(error) }));
    } finally {
      setConfirmModal(prev => ({ ...prev, loading: false }));
    }
  };

  const cancelDeleteEvent = () => {
    setConfirmModal({
      isOpen: false,
      eventId: null,
      eventTitle: '',
      loading: false,
      error: null
    });
  };

  // Get unique years from events
  const availableYears = ['All', ...new Set(events.map(e => e.year))].sort((a, b) => {
    if (a === 'All') return -1;
    if (b === 'All') return 1;
    return b - a;
  });

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.event_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = yearFilter === 'All' || event.year === parseInt(yearFilter);
    const matchesFeatured = featuredFilter === 'All' || 
                           (featuredFilter === 'Featured' && event.featured_event) ||
                           (featuredFilter === 'Regular' && !event.featured_event);
    return matchesSearch && matchesYear && matchesFeatured;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
          <p className="text-gray-600 mt-1">Manage your events and conferences</p>
        </div>
        <button
          onClick={() => openForm()}
          disabled={loading}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Event</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{events.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Featured Events</p>
              <p className="text-2xl font-bold text-gray-900">
                {events.filter(e => e.featured_event).length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">This Year</p>
              <p className="text-2xl font-bold text-gray-900">
                {events.filter(e => e.year === new Date().getFullYear()).length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Filtered Results</p>
              <p className="text-2xl font-bold text-gray-900">{filteredEvents.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <Filter className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Year:</span>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Type:</span>
              <select
                value={featuredFilter}
                onChange={(e) => setFeaturedFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="All">All</option>
                <option value="Featured">Featured</option>
                <option value="Regular">Regular</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading && !error && (
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            <div>
              <h3 className="font-semibold text-blue-800">Loading Events</h3>
              <p className="text-blue-700">Fetching event data...</p>
              {retryCount > 0 && (
                <p className="text-blue-600 text-sm mt-1">
                  Retry attempt {retryCount}/{API_CONFIG.RETRY_ATTEMPTS}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <ErrorAlert error={error} onClose={() => setError(null)} />

      {error && !loading && (
        <div className="text-center">
          <button
            onClick={fetchEvents}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Events Grid */}
      {!loading && !error && (
        <>
          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-4">
                {events.length === 0 
                  ? "Get started by adding your first event."
                  : "No events match your search criteria."
                }
              </p>
              <button
                onClick={() => openForm()}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                Add Event
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {event.featured_event && (
                          <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold mb-2">
                            <Star className="w-3 h-3" />
                            Featured
                          </div>
                        )}
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{event.title}</h3>
                        <p className="text-purple-600 text-sm font-medium">{event.subtitle}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{event.year}</span>
                        <span className="text-gray-400">•</span>
                        <span>{event.event_type}</span>
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location.city}, {event.location.country}</span>
                        </div>
                      )}

                      {event.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{event.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <button
                        onClick={() => openViewModal(event)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => openForm(event)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteEvent(event.id, event.title)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* View Event Modal */}
      {isViewModalOpen && viewingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-900">Event Details</h2>
              <button onClick={closeViewModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Header */}
              <div>
                {viewingEvent.featured_event && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold mb-3">
                    <Star className="w-4 h-4" />
                    Featured Event
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{viewingEvent.title}</h3>
                <p className="text-xl text-purple-600 font-medium mb-4">{viewingEvent.subtitle}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{viewingEvent.year}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{viewingEvent.event_type}</span>
                  </div>
                  {viewingEvent.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{viewingEvent.location.city}, {viewingEvent.location.country}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* About */}
              {viewingEvent.about && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{viewingEvent.about.tagline}</h4>
                  <p className="text-gray-600">{viewingEvent.about.description}</p>
                </div>
              )}

              {/* Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {viewingEvent.email && (
                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm font-medium">Email</span>
                    </div>
                    <p className="text-gray-900">{viewingEvent.email}</p>
                  </div>
                )}
                {viewingEvent.registration_link && (
                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <LinkIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">Registration</span>
                    </div>
                    <a href={viewingEvent.registration_link} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline break-all">
                      Register Now
                    </a>
                  </div>
                )}
              </div>

              {/* Venue */}
              {viewingEvent.venue && (
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Venue
                  </h4>
                  <p className="font-medium text-gray-900">{viewingEvent.venue.name}</p>
                  <p className="text-gray-600 text-sm">{viewingEvent.venue.address}</p>
                </div>
              )}

              {/* Awards */}
              {viewingEvent.awards && viewingEvent.awards.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Awards</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {viewingEvent.awards.map((award, idx) => (
                      <div key={idx} className="bg-white border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{award.icon}</span>
                          <div>
                            <h5 className="font-medium text-gray-900">{award.title}</h5>
                            <p className="text-sm text-gray-600">{award.criteria}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Guests */}
              {viewingEvent.guests && viewingEvent.guests.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Special Guests</h4>
                  <div className="space-y-3">
                    {viewingEvent.guests.map((guest, idx) => (
                      <div key={idx} className="bg-white border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{guest.icon}</span>
                          <div>
                            <p className="text-xs font-medium text-purple-600 uppercase">{guest.type}</p>
                            <h5 className="font-semibold text-gray-900">{guest.name}</h5>
                            <p className="text-sm text-gray-600">{guest.designation}</p>
                            <p className="text-sm text-gray-500">{guest.organization}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    closeViewModal();
                    openForm(viewingEvent);
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-md hover:from-purple-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Edit2 size={16} />
                  Edit Event
                </button>
                <button
                  onClick={() => {
                    closeViewModal();
                    deleteEvent(viewingEvent.id, viewingEvent.title);
                  }}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <EventsForm
        isOpen={isFormOpen}
        onClose={closeForm}
        editingEvent={editingEvent}
        onSuccess={handleFormSuccess}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={cancelDeleteEvent}
        onConfirm={confirmDeleteEvent}
        title="Delete Event"
        message={`Are you sure you want to delete "${confirmModal.eventTitle}"? This action cannot be undone and will permanently remove all event information.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        loading={confirmModal.loading}
        error={confirmModal.error}
      />
    </div>
  );
};

export default EventsManagement;