import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'dart:convert'; // For jsonDecode
import 'package:intl/intl.dart'; // For date formatting
import 'package:http/http.dart' as http; // For http requests

void main() {
  runApp(const MyApp());
}

class Task {
  final int id;
  final String name;
  final int duration;
  final List<String> dependencies;
  final int? assignee;
  final String status;
  final String? commitmentTimestamp;

  Task({
    required this.id,
    required this.name,
    required this.duration,
    required this.dependencies,
    this.assignee,
    required this.status,
    this.commitmentTimestamp,
  });

  factory Task.fromJson(Map<String, dynamic> json) {
    return Task(
      id: json['id'],
      name: json['name'],
      duration: json['duration'],
      dependencies: List<String>.from(json['dependencies'] ?? []),
      assignee: json['assignee'],
      status: json['status'],
      commitmentTimestamp: json['commitmentTimestamp'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'duration': duration,
      'dependencies': dependencies,
      'assignee': assignee,
      'status': status,
      'commitmentTimestamp': commitmentTimestamp,
    };
  }
}

class ActivityLog {
  final int id;
  final int? taskId;
  final int? userId;
  final String action;
  final DateTime timestamp;

  ActivityLog({
    required this.id,
    this.taskId,
    this.userId,
    required this.action,
    required this.timestamp,
  });

  factory ActivityLog.fromJson(Map<String, dynamic> json) {
    return ActivityLog(
      id: json['id'],
      taskId: json['taskId'],
      userId: json['userId'],
      action: json['action'],
      timestamp: DateTime.parse(json['timestamp']),
    );
  }
}

class User {
  final int id;
  final String name;
  final String role;
  final List<String> techStack;
  final int reputationScore;

  User({
    required this.id,
    required this.name,
    required this.role,
    required this.techStack,
    required this.reputationScore,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      role: json['role'],
      techStack: List<String>.from(json['techStack'] ?? []),
      reputationScore: json['reputationScore'],
    );
  }
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Project Manager',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: const MainScreen(),
    );
  }
}

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  static const List<Widget> _widgetOptions = <Widget>[
    TaskListView(),
    UserListView(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Project Manager'),
      ),
      body: _widgetOptions.elementAt(_selectedIndex),
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(Icons.task),
            label: 'My Tasks',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.people),
            label: 'Team',
          ),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.amber[800],
        onTap: _onItemTapped,
      ),
    );
  }
}


class TaskListView extends StatefulWidget {
  const TaskListView({super.key});

  @override
  State<TaskListView> createState() => _TaskListViewState();
}

class _TaskListViewState extends State<TaskListView> {
  late IO.Socket socket;
  List<Task> tasks = [];
  List<ActivityLog> activityLogs = [];
  final int currentUserId = 1; // Hardcoded user ID for now

  @override
  void initState() {
    super.initState();
    _connectToServer();
    _fetchInitialData();
  }

  void _connectToServer() {
    socket = IO.io('http://localhost:3000', <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
    });
    socket.connect();

    socket.onConnect((_) {
      print('connect');
    });

    socket.on('tasksUpdated', (data) {
      print('tasksUpdated: $data');
      _updateTasks(data);
    });

    socket.on('taskCreated', (data) {
      print('taskCreated: $data');
      _addTask(data);
    });

    socket.on('taskUpdated', (data) {
      print('taskUpdated: $data');
      _updateTask(data);
    });

    socket.on('taskDeleted', (data) {
      print('taskDeleted: $data');
      _deleteTask(data);
    });

    socket.on('activityLogged', (data) {
      print('activityLogged: $data');
      _addActivityLog(data);
    });

    socket.onDisconnect((_) => print('disconnect'));
    socket.onConnectError((err) => print('Connect Error: $err'));
    socket.onError((err) => print('Error: $err'));
  }

  Future<void> _fetchInitialData() async {
    try {
      final tasksResponse = await http.get(Uri.parse('http://localhost:3000/tasks'));
      if (tasksResponse.statusCode == 200) {
        _updateTasks(jsonDecode(tasksResponse.body));
      } else {
        print('Failed to load tasks: ${tasksResponse.statusCode}');
      }

      final logsResponse = await http.get(Uri.parse('http://localhost:3000/activity-logs'));
      if (logsResponse.statusCode == 200) {
        _updateActivityLogs(jsonDecode(logsResponse.body));
      } else {
        print('Failed to load activity logs: ${logsResponse.statusCode}');
      }
    } catch (e) {
      print('Error fetching initial data: $e');
    }
  }

  void _updateActivityLogs(dynamic data) {
    setState(() {
      activityLogs = (data as List).map((json) => ActivityLog.fromJson(json)).toList();
    });
  }

  void _updateTasks(dynamic data) {
    setState(() {
      tasks = (data as List).map((json) => Task.fromJson(json)).toList();
    });
  }

  void _addTask(dynamic data) {
    setState(() {
      tasks.add(Task.fromJson(data));
    });
  }

  void _updateTask(dynamic data) {
    setState(() {
      final updatedTask = Task.fromJson(data);
      tasks = tasks.map((task) =>
          task.id == updatedTask.id ? updatedTask : task).toList();
    });
  }

  void _deleteTask(dynamic data) {
    setState(() {
      tasks.removeWhere((task) => task.id == data);
    });
  }

  void _addActivityLog(dynamic data) {
    setState(() {
      activityLogs.add(ActivityLog.fromJson(data));
    });
  }

  Color _getTaskStatusColor(String status) {
    switch (status) {
      case 'pending':
        return Colors.grey;
      case 'in_progress':
        return Colors.blue;
      case 'at_risk_yellow': // Custom status for Accountability Engine
        return Colors.yellow;
      case 'at_risk_red': // Custom status for Accountability Engine
        return Colors.red;
      case 'completed':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  void _commitToTask(Task task) async {
    print('Committing to task: ${task.name}');
    final updatedTask = Task(
        id: task.id,
        name: task.name,
        duration: task.duration,
        dependencies: task.dependencies,
        assignee: currentUserId,
        status: 'in_progress',
        commitmentTimestamp: DateTime.now().toIso8601String()
    );
    try {
      final response = await http.put(
        Uri.parse('http://localhost:3000/tasks/${task.id}'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(updatedTask.toJson()),
      );
      if (response.statusCode != 200) {
        print('Failed to commit to task: ${response.statusCode}');
      }
    } catch (e) {
      print('Error committing to task: $e');
    }
  }

  void _nudgeTask(Task task) {
    print('Nudging task: ${task.name}');
    // This would involve sending a request to the backend to "nudge" the task assignee
  }

  @override
  Widget build(BuildContext context) {
    final assignedTasks = tasks.where((task) => task.assignee == currentUserId).toList();

    return SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('My Assigned Tasks', style: Theme.of(context).textTheme.headlineMedium),
              assignedTasks.isEmpty
                  ? const Center(child: Text('No tasks assigned to you.'))
                  : ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: assignedTasks.length,
                itemBuilder: (context, index) {
                  final task = assignedTasks[index];
                  return Card(
                    margin: const EdgeInsets.symmetric(vertical: 4.0),
                    color: _getTaskStatusColor(task.status).withOpacity(0.2),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            task.name,
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          Text('Duration: ${task.duration} days'),
                          Text('Status: ${task.status}'),
                          if (task.commitmentTimestamp != null)
                            Text('Committed: ${DateFormat.yMd().add_Hms().format(DateTime.parse(task.commitmentTimestamp!))}'),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              if (task.assignee != currentUserId && task.status == 'pending')
                                ElevatedButton(
                                  onPressed: () => _commitToTask(task),
                                  child: const Text('Commit to Task'),
                                ),
                              if (task.assignee == currentUserId && task.status != 'completed')
                                ElevatedButton(
                                  onPressed: () => _nudgeTask(task),
                                  child: const Text('Nudge'),
                                ),
                            ],
                          )
                        ],
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 20),
              Text('Recent Activity', style: Theme.of(context).textTheme.headlineMedium),
              activityLogs.isEmpty
                  ? const Center(child: Text('No activity yet.'))
                  : ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                reverse: true, // Show most recent first
                itemCount: activityLogs.length,
                itemBuilder: (context, index) {
                  final log = activityLogs[index];
                  return Card(
                    margin: const EdgeInsets.symmetric(vertical: 4.0),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(log.action),
                          Text(
                            DateFormat.yMd().add_Hms().format(log.timestamp),
                            style: const TextStyle(color: Colors.grey, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    socket.disconnect();
    super.dispose();
  }
}

class UserListView extends StatefulWidget {
  const UserListView({super.key});

  @override
  State<UserListView> createState() => _UserListViewState();
}

class _UserListViewState extends State<UserListView> {
  late IO.Socket socket;
  List<User> users = [];

  @override
  void initState() {
    super.initState();
    _connectToServer();
    _fetchInitialData();
  }

  void _connectToServer() {
    socket = IO.io('http://localhost:3000', <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
    });
    socket.connect();

    socket.onConnect((_) {
      print('UserListView connected');
    });

    socket.on('userCreated', (data) {
      print('userCreated: $data');
      _addUser(data);
    });

    socket.on('userUpdated', (data) {
      print('userUpdated: $data');
      _updateUser(data);
    });

    socket.on('userDeleted', (data) {
      print('userDeleted: $data');
      _deleteUser(data);
    });

    socket.onDisconnect((_) => print('UserListView disconnected'));
    socket.onConnectError((err) => print('UserListView Connect Error: $err'));
    socket.onError((err) => print('UserListView Error: $err'));
  }

  Future<void> _fetchInitialData() async {
    try {
      final usersResponse = await http.get(Uri.parse('http://localhost:3000/users'));
      if (usersResponse.statusCode == 200) {
        _updateUsers(jsonDecode(usersResponse.body));
      } else {
        print('Failed to load users: ${usersResponse.statusCode}');
      }
    } catch (e) {
      print('Error fetching initial user data: $e');
    }
  }

  void _updateUsers(dynamic data) {
    setState(() {
      users = (data as List).map((json) => User.fromJson(json)).toList();
    });
  }

  void _addUser(dynamic data) {
    setState(() {
      users.add(User.fromJson(data));
    });
  }

  void _updateUser(dynamic data) {
    setState(() {
      final updatedUser = User.fromJson(data);
      users = users.map((user) =>
          user.id == updatedUser.id ? updatedUser : user).toList();
    });
  }

  void _deleteUser(dynamic data) {
    setState(() {
      users.removeWhere((user) => user.id == data);
    });
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Team Members', style: Theme.of(context).textTheme.headlineMedium),
            users.isEmpty
                ? const Center(child: Text('No team members yet.'))
                : ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: users.length,
              itemBuilder: (context, index) {
                final user = users[index];
                return Card(
                  margin: const EdgeInsets.symmetric(vertical: 4.0),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user.name,
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 8),
                        Text('Role: ${user.role}'),
                        Text('Tech Stack: ${user.techStack.join(', ') }'),
                        Text('Reputation Score: ${user.reputationScore}'),
                      ],
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    socket.disconnect();
    super.dispose();
  }
}