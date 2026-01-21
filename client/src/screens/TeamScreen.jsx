import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Modal, Form } from 'react-bootstrap'; // Keep Modal and Form for now
import { FaPlus, FaUsers, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa'; // Import icons

import Message from '../components/Message';
import Loader from '../components/Loader';
import { listTeams, createTeam, joinTeam, deleteTeam, updateTeamJoinRequest } from '../actions/teamActions';
import { TEAM_CREATE_RESET, TEAM_JOIN_RESET, TEAM_DELETE_SUCCESS } from '../constants/teamConstants';

// --- New TeamCard Component ---
const TeamCard = ({ team, userInfo, onDelete }) => {
  // Ensure team.owner and team.members are populated objects
  const isOwner = userInfo && team.owner && team.owner._id === userInfo._id;

  // Render nothing if essential data is missing
  if (!team || !team.owner || !team.members) return null;

  return (
    <div className="team-card">
      <div className="team-card-header">
        <h3 className="team-name">{team.name}</h3>
        <div className="team-owner-avatar" title={`Owner: ${team.owner.name}`}>
          {team.owner.name ? team.owner.name.charAt(0).toUpperCase() : '?'}
        </div>
      </div>
      <div className="team-card-body">
        <div className="member-count-badge">
          <FaUsers /> {team.members.length} Members
        </div>
        {/* Placeholder for Status dot - logic to be added */}
        <div className="team-status-dot" style={{ backgroundColor: 'var(--status-info)' }}></div>
      </div>
      <div className="team-card-actions">
        {isOwner && (
          <>
            <button className="btn btn-icon btn-small" onClick={() => {/* navigate to edit team */}}>
              <FaEdit />
            </button>
            <button className="btn btn-icon btn-small btn-danger" onClick={() => onDelete(team._id)}>
              <FaTrash />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
// ---------------------------------------------------------------------

const TeamScreen = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [createTeamName, setCreateTeamName] = useState('');
  const [joinTeamId, setJoinTeamId] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const teamList = useSelector((state) => state.teamList);
  const { loading, error, teams } = teamList;

  const teamCreate = useSelector((state) => state.teamCreate);
  const {
    loading: loadingCreate,
    error: errorCreate,
    success: successCreate,
  } = teamCreate;

  const teamJoin = useSelector((state) => state.teamJoin);
  const {
    loading: loadingJoin,
    error: errorJoin,
    success: successJoin,
    message: joinTeamMessage,
  } = teamJoin;

  const teamDelete = useSelector((state) => state.teamDelete);
  const {
    loading: loadingDelete,
    error: errorDelete,
    success: successDelete,
  } = teamDelete;

  const teamUpdateJoinRequest = useSelector((state) => state.teamUpdateJoinRequest);
  const {
    loading: loadingUpdateJoinRequest,
    error: errorUpdateJoinRequest,
    success: successUpdateJoinRequest,
    message: updateJoinRequestMessage,
  } = teamUpdateJoinRequest;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    dispatch({ type: TEAM_CREATE_RESET });
    dispatch({ type: TEAM_JOIN_RESET }); // Reset join state

    if (!userInfo || !userInfo.token || userInfo.token.trim() === '') {
      navigate('/login');
    } else {
      dispatch(listTeams());
    }

    if (successCreate) {
      setShowCreate(false);
      setCreateTeamName('');
      dispatch(listTeams()); // Refresh team list after creation
    }

    if (successJoin) {
        setShowJoin(false);
        setJoinTeamId('');
        dispatch(listTeams()); // Refresh team list after joining
    }

    if (successDelete) {
      dispatch({ type: TEAM_DELETE_SUCCESS }); // Reset success state for delete
      dispatch(listTeams()); // Refresh team list after deletion
    }

    if (successUpdateJoinRequest) {
      dispatch(listTeams()); // Refresh teams after approving/rejecting a request
    }

  }, [dispatch, navigate, userInfo, successCreate, successJoin, successDelete, successUpdateJoinRequest]);

  const handleCloseCreate = () => setShowCreate(false);
  const handleShowCreate = () => setShowCreate(true);

  const handleCloseJoin = () => setShowJoin(false);
  const handleShowJoin = () => setShowJoin(true);

  const submitCreateTeamHandler = (e) => {
    e.preventDefault();
    dispatch(createTeam(createTeamName));
  };

  const submitJoinTeamHandler = (e) => {
    e.preventDefault();
    dispatch(joinTeam(joinTeamId));
  };

  const handleJoinRequest = (teamId, userId, action) => {
    dispatch(updateTeamJoinRequest(teamId, userId, action));
  };

  const deleteHandler = (id) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      dispatch(deleteTeam(id));
    }
  };

  // Filter pending requests for teams the user owns
  const teamsWithPendingRequests = teams.filter(team =>
    userInfo && team.owner && team.owner._id === userInfo._id && team.pendingJoinRequests && team.pendingJoinRequests.length > 0
  );

  return (
    <div className="teams-dashboard-page">
      <h1 className="dashboard-title">Teams</h1>

      {/* Action Cards for Create and Join Team */}
      <div className="action-cards-grid">
        <div className="action-card" onClick={handleShowCreate}>
          <FaPlus className="action-card-icon" />
          <h3 className="action-card-title">Create New Team</h3>
          <p className="action-card-description">Start a new collaboration hub.</p>
          <button className="btn btn-primary btn-small">Create Team</button>
        </div>
        <div className="action-card" onClick={handleShowJoin}>
          <FaUsers className="action-card-icon" />
          <h3 className="action-card-title">Join Existing Team</h3>
          <p className="action-card-description">Connect with an existing team.</p>
          <button className="btn btn-secondary btn-small">Join Team</button>
        </div>
      </div>

      {/* Pending Requests Section */}
      {teamsWithPendingRequests.length > 0 && (
        <div className="pending-requests-section">
          <h2 className="section-title">Pending Join Requests</h2>
          <div className="requests-list">
            {teamsWithPendingRequests.map(team => (
              <div key={team._id} className="request-item">
                <p><strong>{team.name}</strong> has requests from:</p>
                <ul>
                  {team.pendingJoinRequests.map(requestingUser => (
                    <li key={requestingUser._id}> {/* Assuming requestingUser is populated here */}
                      <span>{requestingUser.name}</span>
                      <button className="btn btn-icon btn-success btn-small" onClick={() => handleJoinRequest(team._id, requestingUser._id, 'approve')}>
                        <FaCheck />
                      </button>
                      <button className="btn btn-icon btn-danger btn-small" onClick={() => handleJoinRequest(team._id, requestingUser._id, 'reject')}>
                        <FaTimes />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {loadingDelete && <Loader />}
      {errorDelete && <Message variant='danger'>{errorDelete}</Message>}
      {loadingUpdateJoinRequest && <Loader />}
      {errorUpdateJoinRequest && <Message variant='danger'>{errorUpdateJoinRequest}</Message>}
      {successUpdateJoinRequest && <Message variant='success'>{updateJoinRequestMessage}</Message>}
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <div className="team-grid">
          {teams.length === 0 ? (
            <Message variant='info'>No teams found. Create or join one!</Message>
          ) : (
            teams.map((team) => (
              <TeamCard
                key={team._id}
                team={team}
                userInfo={userInfo}
                onDelete={deleteHandler}
              />
            ))
          )}
        </div>
      )}

      {/* Create Team Modal */}
      <Modal show={showCreate} onHide={handleCloseCreate}>
        <Modal.Header closeButton>
          <Modal.Title>Create Team</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingCreate && <Loader />}
          {errorCreate && <Message variant='danger'>{errorCreate}</Message>}
          <Form onSubmit={submitCreateTeamHandler}>
            <Form.Group controlId="createTeamName">
              <Form.Label>Team Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter team name"
                value={createTeamName}
                onChange={(e) => setCreateTeamName(e.target.value)}
              ></Form.Control>
            </Form.Group>
            <button type="submit" className="btn btn-primary mt-3">
              Create
            </button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Join Team Modal */}
      <Modal show={showJoin} onHide={handleCloseJoin}>
        <Modal.Header closeButton>
          <Modal.Title>Join Team</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingJoin && <Loader />}
          {errorJoin && <Message variant='danger'>{errorJoin}</Message>}
          {successJoin && <Message variant='success'>{joinTeamMessage}</Message>}
          <Form onSubmit={submitJoinTeamHandler}>
            <Form.Group controlId="joinTeamId">
              <Form.Label>Team ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Team ID"
                value={joinTeamId}
                onChange={(e) => setJoinTeamId(e.target.value)}
              ></Form.Control>
            </Form.Group>
            <button type="submit" className="btn btn-primary mt-3">
              Join
            </button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TeamScreen;
