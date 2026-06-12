package com.snortids.app.data

import com.google.gson.annotations.SerializedName

data class SnortAlert(
    val id: String,
    val timestamp: String,
    val sid: Int,
    val rev: Int,
    val msg: String,
    val classification: String,
    val priority: Int,
    val protocol: String,
    val srcIp: String,
    val srcPort: Int,
    val dstIp: String,
    val dstPort: Int,
    val payload: String? = null,
    val raw: String? = null
)

data class AlertStats(
    val total: Int,
    val critical: Int,
    val warning: Int,
    val info: Int,
    val uniqueSids: Int,
    val topAttackers: List<TopItem>,
    val topRules: List<TopRule>,
    val protocolBreakdown: List<ProtocolCount>,
    val timeline: List<TimelinePoint>,
    val lastHour: Int
)

data class TopItem(
    val ip: String,
    val count: Int
)

data class TopRule(
    val sid: Int,
    val msg: String,
    val count: Int
)

data class ProtocolCount(
    val protocol: String,
    val count: Int
)

data class TimelinePoint(
    val date: String,
    val count: Int
)
