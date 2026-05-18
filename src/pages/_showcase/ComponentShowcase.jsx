import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '../../components/ui/Button';
import { Toggle } from '../../components/ui/Toggle';
import { Badge, RoleBadge } from '../../components/ui/Badge';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Pagination } from '../../components/ui/Pagination';
import { SidebarButton } from '../../components/ui/SidebarButton';
import { User } from '../../components/ui/User';
import { Tabs } from '../../components/ui/Tabs';
import { Tags } from '../../components/ui/Tags';
import { TableHeader, TableRow, TableCell } from '../../components/ui/Tables';
import { RadarChart } from '../../components/ui/Charts/RadarChart';
import { RadialBarChart } from '../../components/ui/Charts/RadialBarChart';
import { AreaChart } from '../../components/ui/Charts/AreaChart';
import { BarChart } from '../../components/ui/Charts/BarChart';
import {
  QuickInfoCard,
  InfoCard,
  ActionCard,
  EntityCard,
  QuestionCard,
} from '../../components/ui/Cards';
import { EmptyState } from '../../components/ui/EmptyState';
import { RowMenu } from '../../components/ui/RowMenu';
import { Sidebar } from '../../components/layout/Sidebar';
import { Shortcuts } from '../../components/layout/Shortcuts';
import {
  TextInput,
  EmailInput,
  PasswordInput,
  SearchInput,
  DropdownInput,
  Textarea,
  FileInput,
} from '../../components/ui/Input';
import {
  Briefcase,
  FileText,
  Users,
  Settings,
  Hash,
  Building2,
  UserCircle2,
  ArrowRight,
  Plus,
  Star,
  Info,
  Inbox,
  Search,
  AlertCircle,
} from 'lucide-react';

export default function ComponentShowcase() {
  const [toggle1, setToggle1] = useState(true);
  const [toggle2, setToggle2] = useState(false);
  const [role1, setRole1] = useState('owner');
  const [role2, setRole2] = useState('editor');
  const [role3, setRole3] = useState('viewer');
  const [searchValue, setSearchValue] = useState('');
  const [country, setCountry] = useState('');
  const [roleValue, setRoleValue] = useState('user');
  const [currentPage, setCurrentPage] = useState(1);
  const [tableSortColumn, setTableSortColumn] = useState(null);
  const [tableSortDirection, setTableSortDirection] = useState(null);
  const [questions, setQuestions] = useState([
    { id: 1, title: '', description: '', difficulty: '', estimatedTime: '' },
    {
      id: 2,
      title: 'Two Sum Problem',
      description: '',
      difficulty: 'hard',
      estimatedTime: '8 min',
    },
  ]);

  const [editableTags, setEditableTags] = useState(['Kubernetes', 'AWS', 'Python', 'Node.js']);
  const [readonlyTags] = useState(['React', 'TypeScript', 'Docker', 'CI/CD']);
  const [rowMenuOpen, setRowMenuOpen] = useState(false);
  const [rowMenuSelection, setRowMenuSelection] = useState(null);

  const handleAddTag = (newTag) => {
    if (!editableTags.includes(newTag)) {
      setEditableTags([...editableTags, newTag]);
    }
  };

  const handleRemoveTag = (index) => {
    setEditableTags(editableTags.filter((_, i) => i !== index));
  };

  const tableColumns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      width: '300px',
      sortState: tableSortColumn === 'name' ? tableSortDirection : null,
    },
    {
      key: 'job',
      label: 'Job',
      width: '180px',
      sortable: true,
      sortState: tableSortColumn === 'job' ? tableSortDirection : null,
    },
    {
      key: 'score',
      label: 'Score',
      width: '100px',
      sortable: true,
      sortState: tableSortColumn === 'score' ? tableSortDirection : null,
    },
    {
      key: 'date',
      label: 'Date',
      width: '150px',
      sortable: true,
      sortState: tableSortColumn === 'date' ? tableSortDirection : null,
    },
    { key: 'antiCheat', label: 'Anti-cheat', width: '120px', sortable: false },
    { key: 'status', label: 'Status', width: '120px', sortable: false },
  ];

  const handleSort = (columnKey, sortDirection) => {
    setTableSortColumn(sortDirection ? columnKey : null);
    setTableSortDirection(sortDirection);
  };

  const countryOptions = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'au', label: 'Australia' },
  ];

  return (
    <div style={styles.content}>
      <h1 style={styles.title}>Buttons</h1>

      {/* PRIMARY */}
      <Section title="Primary">
        <Button>Button</Button>
        <Button iconLeft={<Info size={16} />}>With Icon</Button>
        <Button iconRight={<Info size={16} />}>Icon Right</Button>
        <Button disabled>Disabled</Button>
      </Section>

      {/* SECONDARY */}
      <Section title="Secondary">
        <Button variant="secondary">Default</Button>
        <Button variant="secondary" iconLeft={<Info size={16} />}>
          With Icon
        </Button>
        <Button variant="secondary" iconRight={<Info size={16} />}>
          Icon Right
        </Button>
        <Button variant="secondary" disabled>
          Disabled
        </Button>
      </Section>

      <h1 style={styles.title}>Toggle</h1>

      {/* TOGGLE */}
      <Section title="Toggle">
        <Toggle checked={toggle1} onChange={setToggle1} />
        <Toggle checked={toggle2} onChange={setToggle2} />
        <Toggle disabled />
        <Toggle checked disabled />
      </Section>

      <h1 style={styles.title}>Badges</h1>

      {/* CANDIDATE STATE */}
      <Section title="Candidate State">
        <Badge type="candidateState" variant="accepted" iconLeft iconRight />
        <Badge type="candidateState" variant="pending" />
        <Badge type="candidateState" variant="shortlist" />
        <Badge type="candidateState" variant="rejected" />
      </Section>

      {/* CHEATING FLAG */}
      <Section title="Cheating Flag">
        <Badge type="cheatingFlag" variant="clean" iconLeft />
        <Badge type="cheatingFlag" variant="flagged" iconLeft />
        <Badge type="cheatingFlag" variant="critical" iconLeft />
      </Section>

      {/* JOB STATUS */}
      <Section title="Job Status">
        <Badge type="jobStatus" variant="active" />
        <Badge type="jobStatus" variant="scheduled" />
        <Badge type="jobStatus" variant="closed" />
      </Section>

      {/* ROLE - Static (no dropdown) */}
      <Section title="Role (Static)">
        <Badge type="role" variant="owner" />
        <Badge type="role" variant="editor" />
        <Badge type="role" variant="viewer" />
      </Section>

      <h1 style={styles.title}>Breadcrumb</h1>

      {/* BREADCRUMB */}
      <Section title="Breadcrumb Navigation" vertical>
        <Breadcrumb items={[{ label: 'Tab 1' }]} />
        <Breadcrumb items={[{ label: 'Tab 1', href: '#' }, { label: 'Tab 2' }]} />
        <Breadcrumb
          items={[{ label: 'Tab 1', href: '#' }, { label: 'Tab 2', href: '#' }, { label: 'Tab 3' }]}
        />
        <Breadcrumb
          items={[
            { label: 'Home', onClick: () => console.log('Home') },
            { label: 'Projects', onClick: () => console.log('Projects') },
            { label: 'Dashboard', onClick: () => console.log('Dashboard') },
            { label: 'Settings' },
          ]}
        />
      </Section>

      {/* ROLE - Interactive with Dropdown */}
      <Section title="Role (Interactive Dropdown)">
        <RoleBadge value={role1} onChange={setRole1} />
        <RoleBadge value={role2} onChange={setRole2} />
        <RoleBadge value={role3} onChange={setRole3} />
        <RoleBadge value="viewer" disabled />
      </Section>

      <h1 style={styles.title}>Input Fields</h1>

      {/* TEXT INPUT */}
      <Section title="Text Input" vertical>
        <TextInput label="Full Name" placeholder="Enter your name" required />
        <TextInput label="Username" placeholder="@username" hint="Choose a unique username" />
        <TextInput
          label="Bio"
          placeholder="Tell us about yourself"
          showInfo
          infoTooltip="Brief description about yourself (max 160 characters)"
        />
      </Section>

      {/* EMAIL INPUT */}
      <Section title="Email Input (with validation)" vertical>
        <EmailInput
          label="Email Address"
          placeholder="you@example.com"
          required
          hint="We'll never share your email"
          showInfo
          infoTooltip="Enter a valid email address for account verification"
        />
        <EmailInput label="Work Email" placeholder="you@company.com" defaultValue="invalid-email" />
      </Section>

      {/* PASSWORD INPUT */}
      <Section title="Password Input" vertical>
        <PasswordInput label="Password" placeholder="Enter password" required />
        <PasswordInput
          label="Confirm Password"
          placeholder="Re-enter password"
          hint="Must be at least 8 characters"
        />
      </Section>

      {/* SEARCH INPUT */}
      <Section title="Search Input (with clear button)" vertical>
        <SearchInput
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <SearchInput
          label="Search Jobs"
          placeholder="Job title, keywords..."
          defaultValue="Designer"
        />
      </Section>

      {/* DROPDOWN INPUT */}
      <Section title="Dropdown Input (native select)" vertical>
        <DropdownInput
          label="Country"
          placeholder="Select country"
          options={countryOptions}
          value={country}
          onChange={(value) => setCountry(value)}
          required
        />
        <DropdownInput
          label="Role"
          options={[
            { value: 'admin', label: 'Administrator' },
            { value: 'user', label: 'User' },
            { value: 'guest', label: 'Guest' },
          ]}
          value={roleValue}
          onChange={(value) => setRoleValue(value)}
        />
      </Section>

      {/* TEXTAREA */}
      <Section title="Textarea (with counter & autosize)" vertical>
        <Textarea
          label="Description"
          placeholder="Write a description..."
          rows={3}
          hint="Brief overview of the project"
        />
        <Textarea
          label="Cover Letter"
          placeholder="Why do you want this job?"
          maxLength={500}
          showCounter
          required
        />
        <Textarea
          label="Auto-resize Comment"
          placeholder="Type to see auto-resize..."
          autosize
          maxHeight={200}
          hint="This textarea grows as you type"
        />
      </Section>

      {/* FILE INPUT */}
      <Section title="File Upload" vertical>
        <FileInput label="Upload Resume" hint="PDF or DOCX, max 5MB" />
        <FileInput label="Profile Picture" hint="JPG or PNG" required />
      </Section>

      {/* INPUT STATES */}
      <Section title="Input States" vertical>
        <TextInput label="Disabled" placeholder="Cannot type" disabled />
        <TextInput
          label="Error State"
          placeholder="Invalid input"
          hint="This field has an error"
          error
        />
      </Section>

      <h1 style={styles.title}>Pagination</h1>

      {/* PAGINATION */}
      <Section title="Basic Pagination">
        <div style={styles.paginationDemo}>
          <Pagination currentPage={currentPage} totalPages={10} onPageChange={setCurrentPage} />

          <Pagination
            currentPage={1}
            totalPages={5}
            onPageChange={(page) => console.log('Page:', page)}
          />

          <Pagination
            currentPage={25}
            totalPages={100}
            onPageChange={(page) => console.log('Page:', page)}
          />
        </div>
      </Section>

      <h1 style={styles.title}>Sidebar Buttons</h1>

      {/* SIDEBAR BUTTONS */}
      <Section title="Basic Sidebar Buttons" vertical>
        <div style={styles.sidebarDemo}>
          <SidebarButton icon={Briefcase} label="Candidates" />
          <SidebarButton icon={FileText} label="Mocks" />
          <SidebarButton icon={Users} label="Team" />
          <SidebarButton icon={Settings} label="Settings" isActive />
        </div>
      </Section>

      {/* SIDEBAR BUTTONS WITH SUB ITEMS */}
      <Section title="Sidebar Buttons with Sub-items" vertical>
        <div style={styles.sidebarDemo}>
          <SidebarButton
            icon={Briefcase}
            label="Candidates"
            subItems={[
              { label: 'Job Management', isActive: true },
              { label: 'Create Job', isActive: false },
              { label: 'Pipeline', isActive: true },
            ]}
          />
          <SidebarButton
            icon={FileText}
            label="Mocks"
            subItems={[
              { label: 'All Mocks', isActive: false },
              { label: 'Create Mock', isActive: false },
            ]}
          />
          <SidebarButton icon={Users} label="Team" isActive />
        </div>
      </Section>

      <h1 style={styles.title}>User Component</h1>

      {/* USER COMPONENT */}
      <Section title="User Display" vertical>
        <div style={styles.userDemo}>
          <User name="Hamedisntgay" email="Hamedisntgay@gmail.com" icon={Hash} />
        </div>
      </Section>

      <h1 style={styles.title}>Sidebar Layout</h1>

      {/* SIDEBAR LAYOUT */}
      <Section title="Complete Sidebar" vertical>
        <div style={styles.sidebarLayoutDemo}>
          <Sidebar
            navItems={[
              {
                icon: Briefcase,
                label: 'Candidates',
                isActive: false,
              },
              {
                icon: Briefcase,
                label: 'Jobs',
                isActive: true,
                subItems: [
                  { label: 'Job Management', isActive: true },
                  { label: 'Create Job', isActive: false },
                ],
              },
              {
                icon: FileText,
                label: 'Mocks',
              },
              {
                icon: Building2,
                label: 'Company',
                separator: true,
              },
              {
                icon: UserCircle2,
                label: 'Profile',
              },
              {
                icon: Settings,
                label: 'Settings',
              },
            ]}
            user={{
              name: 'Hamedisntgay',
              email: 'Hamedisntgay@gmail.com',
              icon: Hash,
            }}
          />
        </div>
      </Section>

      <h1 style={styles.title}>Tabs</h1>

      {/* TABS COMPONENT */}
      <Section title="Tab Navigation" vertical>
        <div style={styles.tabsDemo}>
          <Tabs
            items={[
              { label: 'Pipeline', isActive: true },
              { label: 'Overview', isActive: false },
            ]}
          />
        </div>
        <div style={styles.tabsDemo}>
          <Tabs
            items={[
              { label: 'Full Feedback', isActive: true },
              { label: 'Mock Replay', isActive: false },
              { label: 'CV Analysis', isActive: false },
            ]}
          />
        </div>
      </Section>

      <h1 style={styles.title}>Shortcuts Bar</h1>

      {/* SHORTCUTS LAYOUT */}
      <Section title="Shortcuts Layout" vertical>
        <div style={styles.shortcutsDemo}>
          <Shortcuts
            filterLabel="Filters"
            filterCount="25 Job Selected"
            onFilterClick={() => {}}
            searchValue=""
            onSearchChange={() => {}}
            searchPlaceholder="Search"
            secondaryAction={{
              label: '5 Active jobs',
              icon: ArrowRight,
              iconPosition: 'right',
            }}
            primaryAction={{
              label: 'Create job',
              icon: Plus,
              iconPosition: 'right',
            }}
          />
        </div>
      </Section>

      <h1 style={styles.title}>Table Header</h1>

      {/* TABLE HEADER */}
      <Section title="Table Header with Sort" vertical>
        <div style={styles.tableDemo}>
          <TableHeader columns={tableColumns} onSort={handleSort} />
        </div>
      </Section>

      <h1 style={styles.title}>Table Rows</h1>

      {/* TABLE ROW WITH CELLS */}
      <Section title="Table Rows with Data" vertical>
        <div style={styles.tableDemo}>
          <TableHeader columns={tableColumns} onSort={handleSort} />

          {/* Row 1 - With icon, badges, and menu */}
          <TableRow showMenu onMenuClick={() => console.log('Menu clicked')}>
            <TableCell width="300px" color="primary">
              John Doe
            </TableCell>
            <TableCell width="180px" color="secondary">
              Software Engineer
            </TableCell>
            <TableCell
              width="100px"
              color="primary"
              icon={<Star size={14} fill="var( --brand-default)" stroke="var( --brand-default)" />}
            >
              4.8
            </TableCell>
            <TableCell width="150px" color="tertiary">
              Jan 15, 2026
            </TableCell>
            <TableCell width="120px">
              <Badge type="cheatingFlag" variant="clean" iconLeft />
            </TableCell>
            <TableCell width="120px">
              <Badge type="candidateState" variant="accepted" />
            </TableCell>
          </TableRow>

          {/* Row 2 - Different data */}
          <TableRow showMenu onMenuClick={() => console.log('Menu clicked')}>
            <TableCell width="300px" color="primary">
              Jane Smith
            </TableCell>
            <TableCell width="180px" color="secondary">
              Product Designer
            </TableCell>
            <TableCell
              width="100px"
              color="primary"
              icon={<Star size={14} fill="var( --brand-default)" stroke="var( --brand-default)" />}
            >
              4.5
            </TableCell>
            <TableCell width="150px" color="tertiary">
              Jan 12, 2026
            </TableCell>
            <TableCell width="120px">
              <Badge type="cheatingFlag" variant="flagged" iconLeft />
            </TableCell>
            <TableCell width="120px">
              <Badge type="candidateState" variant="pending" />
            </TableCell>
          </TableRow>

          {/* Row 3 - Critical flagged */}
          <TableRow showMenu onMenuClick={() => console.log('Menu clicked')}>
            <TableCell width="300px" color="primary">
              Alex Johnson
            </TableCell>
            <TableCell width="180px" color="secondary">
              Data Analyst
            </TableCell>
            <TableCell
              width="100px"
              color="primary"
              icon={<Star size={14} fill="var( --brand-default)" stroke="var( --brand-default)" />}
            >
              3.2
            </TableCell>
            <TableCell width="150px" color="tertiary">
              Jan 10, 2026
            </TableCell>
            <TableCell width="120px">
              <Badge type="cheatingFlag" variant="critical" iconLeft />
            </TableCell>
            <TableCell width="120px">
              <Badge type="candidateState" variant="rejected" />
            </TableCell>
          </TableRow>

          {/* Row 4 - Shortlisted */}
          <TableRow showMenu onMenuClick={() => console.log('Menu clicked')}>
            <TableCell width="300px" color="primary">
              Emily Brown
            </TableCell>
            <TableCell width="180px" color="secondary">
              Frontend Developer
            </TableCell>
            <TableCell
              width="100px"
              color="primary"
              icon={<Star size={14} fill="var( --brand-default)" stroke="var( --brand-default)" />}
            >
              4.9
            </TableCell>
            <TableCell width="150px" color="tertiary">
              Jan 08, 2026
            </TableCell>
            <TableCell width="120px">
              <Badge type="cheatingFlag" variant="clean" iconLeft />
            </TableCell>
            <TableCell width="120px">
              <Badge type="candidateState" variant="shortlist" />
            </TableCell>
          </TableRow>
        </div>
      </Section>

      {/* TABLE ROWS WITHOUT MENU */}
      <Section title="Table Rows (No Menu)" vertical>
        <div style={styles.tableDemo}>
          <TableRow>
            <TableCell width="200px" color="primary">
              Primary Text
            </TableCell>
            <TableCell width="200px" color="secondary">
              Secondary Text
            </TableCell>
            <TableCell width="200px" color="tertiary">
              Tertiary Text
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell width="200px" color="primary" icon={<Star size={14} />}>
              With Icon
            </TableCell>
            <TableCell width="200px" color="secondary">
              Regular
            </TableCell>
            <TableCell width="200px">
              <Badge type="jobStatus" variant="active" />
            </TableCell>
          </TableRow>
        </div>
      </Section>

      <h1 style={styles.title}>Radar Chart</h1>

      {/* RADAR CHART */}
      <Section title="Radar Chart Component">
        <div style={styles.statsDemo}>
          <RadarChart
            title="Candidate Skills"
            stats={[
              { label: 'Communication', value: 85 },
              { label: 'Technical', value: 72 },
              { label: 'Problem Solving', value: 90 },
              { label: 'Time Mgmt', value: 60 },
              { label: 'Teamwork', value: 78 },
            ]}
          />
          <RadarChart
            title="Performance Metrics"
            stats={[
              { label: 'Communication', value: 95 },
              { label: 'Technical Skills', value: 78 },
              { label: 'Problem Solving', value: 62 },
              { label: 'Time Management', value: 45 },
              { label: 'Critical Thinking', value: 25 },
            ]}
          />
        </div>
      </Section>

      <h1 style={styles.title}>Radial Bar Chart</h1>

      {/* RADIAL BAR CHART */}
      <Section title="Radial Bar Chart Component">
        <div style={styles.statsDemo}>
          <RadialBarChart
            title="Score Distribution"
            data={[
              { label: 'Excellent (90-100)', value: 145 },
              { label: 'High (70-89)', value: 77 },
              { label: 'Moderate (50-69)', value: 44 },
              { label: 'Low (0-49)', value: 31 },
            ]}
          />
          <RadialBarChart
            title="Application Status"
            data={[
              { label: 'Accepted', value: 42 },
              { label: 'In Review', value: 28 },
              { label: 'Pending', value: 15 },
              { label: 'Rejected', value: 8 },
            ]}
          />
        </div>
      </Section>

      <h1 style={styles.title}>Area Chart</h1>

      {/* AREA CHART */}
      <Section title="Area Chart Component">
        <div style={styles.statsDemo}>
          <AreaChart
            title="Application Trend"
            data={[
              { week: 'Week 1', applications: 24, mocks: 18 },
              { week: 'Week 2', applications: 31, mocks: 22 },
              { week: 'Week 3', applications: 28, mocks: 26 },
              { week: 'Week 4', applications: 42, mocks: 35 },
              { week: 'Week 5', applications: 38, mocks: 30 },
              { week: 'Week 6', applications: 55, mocks: 47 },
            ]}
            xKey="week"
            dataKeys={[
              { key: 'applications', label: 'Applications', color: '#e64f28' },
              { key: 'mocks', label: 'Completed Mocks', color: '#0057b5' },
            ]}
          />
        </div>
      </Section>

      <h1 style={styles.title}>Bar Chart</h1>

      {/* BAR CHART */}
      <Section title="Bar Chart Component">
        <div style={styles.statsDemo}>
          <BarChart
            title="Avg. Score by Role"
            data={[
              { label: 'Frontend', value: 78 },
              { label: 'Backend', value: 85 },
              { label: 'UI/UX', value: 72 },
              { label: 'Data Analyst', value: 69 },
              { label: 'DevOps', value: 81 },
            ]}
            dataKeys={[{ key: 'value', label: 'Avg Score' }]}
          />
        </div>
      </Section>

      <h1 style={styles.title}>Info Cards</h1>

      {/* INFO CARDS */}
      <Section title="Info Card Component">
        <div style={styles.cardsDemo}>
          <InfoCard
            title="Welcome to AI Platform"
            description="Get started with intelligent automation and insights"
          />
          <InfoCard
            title="Getting Started Guide"
            description="Learn the basics and explore key features"
          />
          <InfoCard
            title="Clickable Card"
            description="This card has an interactive click handler"
            onClick={() => console.log('Info card clicked!')}
          />
          <InfoCard title="Simple Title Only" />
        </div>
      </Section>

      <h1 style={styles.title}>Action Cards</h1>

      {/* ACTION CARDS */}
      <Section title="Action Card Component">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
          {/* Full example with all features */}
          <ActionCard
            title="Title"
            subtitle="Subtitle"
            caption="Caption"
            showBadge={true}
            badgeType="cheatingFlag"
            badgeVariant="clean"
            badgeIcon={true}
            showButton={true}
            buttonText="Remove"
            onButtonClick={() => console.log('Remove clicked!')}
            descriptionTitle="Description Title"
            showDescriptionIcon={true}
            descriptionNumber={99}
            content="Excellent! You quickly identified the optimal hash map approach and implemented it correctly. Your code was clean and well-commented."
          />

          {/* Without button, only badge */}
          <ActionCard
            title="Project Review"
            subtitle="Submitted for approval"
            caption="2 hours ago"
            showBadge={true}
            badgeType="candidateState"
            badgeVariant="pending"
            descriptionTitle="Code Quality"
            showDescriptionIcon={true}
            descriptionNumber={87}
            content="Great work on implementing the authentication system. The code is well-structured and follows best practices."
          />

          {/* Without badge */}
          <ActionCard
            title="Task Assignment"
            subtitle="High priority task"
            caption="Due: Today"
            showButton={true}
            buttonText="View Details"
            onButtonClick={() => console.log('View clicked!')}
            content="Complete the database migration and update all related documentation."
          />

          {/* Minimal - just title and content */}
          <ActionCard
            title="Simple Notification"
            content="This is a basic action card with minimal configuration."
          />

          {/* With description but no content */}
          <ActionCard
            title="Performance Metrics"
            subtitle="Last evaluation"
            caption="Updated: 2h ago"
            descriptionTitle="Overall Score"
            showDescriptionIcon={true}
            descriptionNumber={95}
          />
        </div>
      </Section>

      <h1 style={styles.title}>Entity Cards</h1>

      {/* ENTITY CARDS */}
      <Section title="Entity Card Component">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
          {/* Full example with all features */}
          <EntityCard
            userName="John Doe"
            userEmail="john@example.com"
            userIcon={UserCircle2}
            caption="1d : 7h : 13m"
            showBadge={true}
            badgeType="candidateState"
            badgeVariant="accepted"
            showButton={true}
            buttonText="Edit"
            buttonVariant="primary"
            onButtonClick={() => console.log('Edit clicked!')}
            showSave={true}
            onSave={() => console.log('Saved!')}
            colLeft={{ icon: Briefcase, title: 'job', subtitle: 'Subtitle' }}
            colMid={{ icon: Star, title: 'Score', subtitle: 'Subtitle' }}
            colRight={{ icon: Hash, title: 'Date', subtitle: 'Subtitle' }}
            showMenu={true}
            onMenuClick={() => console.log('Menu clicked!')}
            showDescription={true}
            descriptionTitle="Description Title"
            descriptionContent="Excellent! You quickly identified the optimal hash map approach and implemented it correctly. Your code was clean and well-commented."
          />

          {/* Without description */}
          <EntityCard
            userName="Jane Smith"
            userEmail="jane@example.com"
            userIcon={UserCircle2}
            caption="2h ago"
            showBadge={true}
            badgeType="candidateState"
            badgeVariant="pending"
            showButton={true}
            buttonText="Review"
            buttonVariant="secondary"
            onButtonClick={() => console.log('Review clicked!')}
            showSave={true}
            colLeft={{ icon: Briefcase, title: 'Frontend Developer', subtitle: 'Engineering' }}
            colMid={{ icon: Star, title: '95', subtitle: 'Performance' }}
            colRight={{ icon: Hash, title: 'Today', subtitle: 'Application Date' }}
            showMenu={true}
          />

          {/* Minimal - just user and columns */}
          <EntityCard
            userName="Alice Johnson"
            userEmail="alice@example.com"
            userIcon={UserCircle2}
            colLeft={{ icon: Briefcase, title: 'Designer', subtitle: 'Creative Team' }}
            colMid={{ icon: Star, title: '88', subtitle: 'Rating' }}
            colRight={{ icon: Hash, title: 'Yesterday', subtitle: 'Last Active' }}
          />

          {/* With description, no badge */}
          <EntityCard
            userName="Bob Wilson"
            userEmail="bob@example.com"
            userIcon={UserCircle2}
            caption="3d : 2h : 45m"
            showButton={true}
            buttonText="View Profile"
            buttonVariant="secondary"
            onButtonClick={() => console.log('View profile!')}
            colLeft={{ icon: Briefcase, title: 'Backend Engineer', subtitle: 'Systems' }}
            colMid={{ icon: Star, title: '92', subtitle: 'Code Quality' }}
            colRight={{ icon: Hash, title: 'Last Week', subtitle: 'Submitted' }}
            showDescription={true}
            descriptionTitle="Technical Assessment"
            descriptionContent="Strong understanding of distributed systems and microservices architecture. Implemented a scalable solution with proper error handling."
          />

          {/* With save only, no other controls */}
          <EntityCard
            userName="Emma Davis"
            userEmail="emma@example.com"
            userIcon={UserCircle2}
            showSave={true}
            onSave={() => console.log('Saved!')}
            colLeft={{ icon: Briefcase, title: 'Product Manager', subtitle: 'Product Team' }}
            colMid={{ icon: Star, title: '87', subtitle: 'Leadership' }}
            colRight={{ icon: Hash, title: '5 days ago', subtitle: 'Interview Date' }}
            showMenu={true}
            onMenuClick={() => console.log('Menu opened!')}
          />
        </div>
      </Section>

      <h1 style={styles.title}>Quick Info Cards</h1>

      {/* QUICK INFO CARDS */}
      <Section title="Quick Info Card Component">
        <div style={styles.cardsDemo}>
          <QuickInfoCard icon={<Users />} number={37} title="Total Users" />
          <QuickInfoCard icon={<Briefcase />} number={1247} title="Active Jobs" />
          <QuickInfoCard icon={<FileText />} number={89} title="Pending Reviews" />
          <QuickInfoCard icon={<Settings />} number={12} title="System Alerts" />
          <QuickInfoCard
            icon={<Users />}
            number={2456}
            title="Applications"
            onClick={() => console.log('Card clicked!')}
          />
        </div>
      </Section>

      <h1 style={styles.title}>Question Cards</h1>

      {/* QUESTION CARDS */}
      <Section title="Question Card Component - Interactive Form">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
          {questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              questionNumber={index + 1}
              title={question.title}
              description={question.description}
              difficulty={question.difficulty}
              estimatedTime={question.estimatedTime}
              defaultExpanded={index === 0}
              onChange={(data) => {
                const newQuestions = [...questions];
                newQuestions[index] = { ...question, ...data };
                setQuestions(newQuestions);
              }}
              onRemove={() => {
                setQuestions(questions.filter((q) => q.id !== question.id));
              }}
            />
          ))}

          <Button
            iconLeft={<Plus size={16} />}
            onClick={() => {
              setQuestions([
                ...questions,
                {
                  id: Date.now(),
                  title: '',
                  description: '',
                  difficulty: '',
                  estimatedTime: '',
                },
              ]);
            }}
          >
            Add Question
          </Button>
        </div>
      </Section>

      {/* TAGS */}
      <Section title="Tags Component" vertical>
        <Tags
          title="Editable Tags"
          tags={editableTags}
          variant="editable"
          onAdd={handleAddTag}
          onRemove={(_, index) => handleRemoveTag(index)}
        />

        <Tags title="Read-only Tags" tags={readonlyTags} variant="readonly" />

        <Tags
          tags={['Single', 'Line', 'Tags']}
          variant="editable"
          showTitle={false}
          onAdd={(tag) => console.log('Add tag:', tag)}
          onRemove={(tag, index) => console.log('Remove', tag, index)}
        />
      </Section>

      <h1 style={styles.title}>Empty State</h1>

      {/* EMPTY STATE */}
      <Section title="Empty State - With Icon & Action">
        <div style={styles.cardsDemo}>
          <EmptyState
            icon={<Inbox size={40} />}
            title="No candidates yet"
            description="Add your first candidate to get started with the pipeline."
            action={<Button iconLeft={<Plus size={16} />}>Add Candidate</Button>}
          />
          <EmptyState
            icon={<Search size={40} />}
            title="No results found"
            description="Try adjusting your search or filter to find what you're looking for."
          />
          <EmptyState
            icon={<AlertCircle size={40} />}
            title="Something went wrong"
            description="We couldn't load the data. Please try again later."
            action={<Button variant="secondary">Retry</Button>}
          />
        </div>
      </Section>

      <Section title="Empty State - Minimal">
        <div style={styles.cardsDemo}>
          <EmptyState title="No data" description="Nothing to display here." />
          <EmptyState title="Empty" />
        </div>
      </Section>

      <h1 style={styles.title}>Row Menu</h1>

      {/* ROW MENU */}
      <Section title="Row Menu - Inline Context Menu" vertical>
        <div style={styles.rowMenuDemo}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            Click the button to toggle the row menu. Selected:{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{rowMenuSelection || 'None'}</strong>
          </p>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Button variant="secondary" onClick={() => setRowMenuOpen(!rowMenuOpen)}>
              {rowMenuOpen ? 'Close Menu' : 'Open Menu'}
            </Button>
            <RowMenu
              open={rowMenuOpen}
              onSelect={(id) => {
                setRowMenuSelection(id);
                setRowMenuOpen(false);
              }}
              onClose={() => setRowMenuOpen(false)}
            />
          </div>
        </div>
      </Section>
    </div>
  );
}

/* ------------------ */
/* Helper Components */
/* ------------------ */

function Section({ title, children, vertical }) {
  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <div style={vertical ? styles.column : styles.row}>{children}</div>
    </div>
  );
}

Section.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  vertical: PropTypes.bool,
};

/* ------------------ */
/* Inline styles only for demo layout */
/* ------------------ */

const styles = {
  content: {
    padding: '40px',
  },
  title: {
    fontSize: '48px',
    fontWeight: 600,
    marginBottom: '40px',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 500,
    marginBottom: '16px',
    color: 'var(--text-secondary)',
  },
  row: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '1200px',
  },
  paginationDemo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    alignItems: 'flex-start',
  },
  sidebarDemo: {
    width: '280px',
    padding: '16px',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-default)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  userDemo: {
    width: '280px',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-default)',
  },
  sidebarLayoutDemo: {
    width: '280px',
    height: '100vh',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
  },
  tabsDemo: {
    width: '100%',
    maxWidth: '600px',
  },
  shortcutsDemo: {
    width: '100%',
  },
  tableDemo: {
    width: '100%',
    backgroundColor: 'var(--bg-surface)',
  },
  statsDemo: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  cardsDemo: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  rowMenuDemo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '24px',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-default)',
    width: '400px',
  },
  tagsDemo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    width: '100%',
  },
};
