package com.snortids.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.snortids.app.data.AlertStats
import com.snortids.app.data.SnortAlert
import com.snortids.app.viewmodel.AlertViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(viewModel: AlertViewModel = viewModel()) {
    val state by viewModel.uiState.collectAsState()

    LaunchedEffect(state.isLiveMode) {
        if (state.isLiveMode) {
            while (true) {
                viewModel.loadData()
                kotlinx.coroutines.delay(15000)
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Filled.Shield, contentDescription = null, tint = Color(0xFF22C55E))
                        Spacer(Modifier.width(8.dp))
                        Text("SNORT IDS", fontWeight = FontWeight.Bold)
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.loadData() }) {
                        Icon(Icons.Filled.Refresh, contentDescription = "Refresh")
                    }
                    IconButton(onClick = { viewModel.toggleLiveMode() }) {
                        Icon(
                            if (state.isLiveMode) Icons.Filled.FiberManualRecord else Icons.Filled.FiberManualRecordOutlined,
                            contentDescription = "Live Mode",
                            tint = if (state.isLiveMode) Color.Red else Color.Gray
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface
                )
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Stats summary
            item { StatsRow(state.stats) }

            // Search
            item {
                OutlinedTextField(
                    value = state.searchQuery,
                    onValueChange = { viewModel.setSearchQuery(it) },
                    placeholder = { Text("Search IP, message...") },
                    leadingIcon = { Icon(Icons.Filled.Search, contentDescription = null) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp)
                )
            }

            // Error
            if (state.error != null) {
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFFFEBEE)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Filled.Error, contentDescription = null, tint = Color.Red)
                            Spacer(Modifier.width(12.dp))
                            Text(state.error!!, color = Color.Red, fontSize = 14.sp)
                        }
                    }
                }
            }

            // Loading
            if (state.loading && state.alerts.isEmpty()) {
                item {
                    Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator()
                    }
                }
            }

            // Alert list
            item {
                Text(
                    "Alerts (${state.alerts.size})",
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 18.sp,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }

            items(state.alerts.take(100)) { alert ->
                AlertCard(alert, onClick = { viewModel.selectAlert(alert) })
            }
        }
    }

    // Detail dialog
    state.selectedAlert?.let { alert ->
        AlertDetailDialog(alert, onDismiss = { viewModel.clearSelection() })
    }
}

@Composable
fun StatsRow(stats: AlertStats?) {
    if (stats == null) return
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        StatCard("Total", stats.total.toString(), Color(0xFF3B82F6))
        StatCard("Critical", stats.critical.toString(), Color(0xFFEF4444))
        StatCard("Warning", stats.warning.toString(), Color(0xFFF59E0B))
        StatCard("Last Hr", stats.lastHour.toString(), Color(0xFF06B6D4))
    }
}

@Composable
fun StatCard(label: String, value: String, color: Color) {
    Card(
        modifier = Modifier.weight(1f),
        colors = CardDefaults.cardColors(
            containerColor = color.copy(alpha = 0.1f)
        )
    ) {
        Column(modifier = Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text(value, fontWeight = FontWeight.Bold, fontSize = 22.sp, color = color)
            Text(label, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface)
        }
    }
}

@Composable
fun AlertCard(alert: SnortAlert, onClick: () -> Unit) {
    val priorityColor = when (alert.priority) {
        1 -> Color(0xFFEF4444)
        2 -> Color(0xFFF59E0B)
        else -> Color(0xFF6B7280)
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .background(priorityColor, RoundedCornerShape(4.dp))
                )
                Spacer(Modifier.width(8.dp))
                Text(
                    alert.msg,
                    fontWeight = FontWeight.Medium,
                    fontSize = 14.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f)
                )
                Text(
                    "P${alert.priority}",
                    fontSize = 11.sp,
                    color = priorityColor,
                    fontWeight = FontWeight.SemiBold
                )
            }
            Spacer(Modifier.height(6.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    alert.protocol,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                    color = when (alert.protocol) {
                        "TCP" -> Color(0xFF3B82F6)
                        "UDP" -> Color(0xFF8B5CF6)
                        else -> Color(0xFF22C55E)
                    },
                    modifier = Modifier
                        .background(
                            when (alert.protocol) {
                                "TCP" -> Color(0xFF3B82F6).copy(alpha = 0.1f)
                                "UDP" -> Color(0xFF8B5CF6).copy(alpha = 0.1f)
                                else -> Color(0xFF22C55E).copy(alpha = 0.1f)
                            },
                            RoundedCornerShape(4.dp)
                        )
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                )
                Spacer(Modifier.width(12.dp))
                Icon(Icons.Filled.ArrowForward, contentDescription = null, modifier = Modifier.size(12.dp), tint = Color.Gray)
                Spacer(Modifier.width(4.dp))
                Text(
                    "${alert.srcIp}:${alert.srcPort}",
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                    color = Color(0xFFEF4444)
                )
                Spacer(Modifier.width(4.dp))
                Icon(Icons.Filled.ArrowForward, contentDescription = null, modifier = Modifier.size(12.dp), tint = Color.Gray)
                Spacer(Modifier.width(4.dp))
                Text(
                    "${alert.dstIp}:${alert.dstPort}",
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                    color = Color(0xFF3B82F6)
                )
            }
            Spacer(Modifier.height(4.dp))
            Text(
                alert.timestamp,
                fontSize = 10.sp,
                color = Color.Gray,
                fontFamily = FontFamily.Monospace
            )
        }
    }
}

@Composable
fun AlertDetailDialog(alert: SnortAlert, onDismiss: () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Filled.Shield, contentDescription = null, tint = Color(0xFF22C55E))
                Spacer(Modifier.width(8.dp))
                Text("Alert Detail", fontWeight = FontWeight.Bold)
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                DetailRow("Message", alert.msg)
                DetailRow("Classification", alert.classification)
                DetailRow("Rule", "SID ${alert.sid} (rev ${alert.rev})")
                DetailRow("Priority", "P${alert.priority} - ${
                    when (alert.priority) {
                        1 -> "Critical"
                        2 -> "Warning"
                        else -> "Info"
                    }
                }")

                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xFFFFF3F0)
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("Source", fontSize = 11.sp, color = Color(0xFFEF4444), fontWeight = FontWeight.SemiBold)
                        Text("${alert.srcIp}:${alert.srcPort}", fontFamily = FontFamily.Monospace, fontSize = 13.sp)
                    }
                }

                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xFFF0F4FF)
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("Destination", fontSize = 11.sp, color = Color(0xFF3B82F6), fontWeight = FontWeight.SemiBold)
                        Text("${alert.dstIp}:${alert.dstPort}", fontFamily = FontFamily.Monospace, fontSize = 13.sp)
                    }
                }

                DetailRow("Protocol", alert.protocol)
                DetailRow("Timestamp", alert.timestamp)

                if (!alert.payload.isNullOrBlank()) {
                    Text("Payload (Hex)", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                    Text(
                        alert.payload,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 10.sp,
                        color = Color.Gray
                    )
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Close")
            }
        }
    )
}

@Composable
fun DetailRow(label: String, value: String) {
    Column {
        Text(label, fontSize = 11.sp, color = Color.Gray, fontWeight = FontWeight.SemiBold)
        Text(value, fontSize = 14.sp, fontFamily = FontFamily.Monospace)
    }
}
