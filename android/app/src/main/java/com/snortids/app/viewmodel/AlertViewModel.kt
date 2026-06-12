package com.snortids.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.snortids.app.data.AlertStats
import com.snortids.app.data.ApiClient
import com.snortids.app.data.SnortAlert
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class AlertUiState(
    val alerts: List<SnortAlert> = emptyList(),
    val stats: AlertStats? = null,
    val selectedAlert: SnortAlert? = null,
    val loading: Boolean = false,
    val error: String? = null,
    val searchQuery: String = "",
    val isLiveMode: Boolean = false,
)

class AlertViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(AlertUiState())
    val uiState: StateFlow<AlertUiState> = _uiState

    fun loadData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(loading = true, error = null)
            try {
                val alerts = ApiClient.service.getAlerts(
                    search = _uiState.value.searchQuery.ifBlank { null }
                )
                val stats = ApiClient.service.getStats()
                _uiState.value = _uiState.value.copy(
                    alerts = alerts,
                    stats = stats,
                    loading = false
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    loading = false,
                    error = "Failed to load: ${e.message}"
                )
            }
        }
    }

    fun setSearchQuery(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
        if (query.length >= 2 || query.isEmpty()) {
            loadData()
        }
    }

    fun selectAlert(alert: SnortAlert) {
        _uiState.value = _uiState.value.copy(selectedAlert = alert)
    }

    fun clearSelection() {
        _uiState.value = _uiState.value.copy(selectedAlert = null)
    }

    fun toggleLiveMode() {
        _uiState.value = _uiState.value.copy(
            isLiveMode = !_uiState.value.isLiveMode
        )
    }

    init {
        loadData()
    }
}
